/**
 * ------------------------------------------------------------------------
 * File: marketplaceStorage.js
 * Author: Tiago Gonçalves
 * Date: 2026-04-29
 * Version: 1.0
 * Description:
 * Acesso ao armazenamento de fotos do marketplace
 * ------------------------------------------------------------------------
 */
const { createClient } = require("@supabase/supabase-js");

const CACHE_IMAGENS_TTL_MS = 60 * 1000;
const cacheImagensPorAnuncio = new Map();

const obterCacheImagens = (idAnuncio) => {
  const entrada = cacheImagensPorAnuncio.get(idAnuncio);
  if (!entrada) return null;
  if (Date.now() > entrada.expiresAt) {
    cacheImagensPorAnuncio.delete(idAnuncio);
    return null;
  }
  return entrada.urls;
};

const guardarCacheImagens = (idAnuncio, urls) => {
  cacheImagensPorAnuncio.set(idAnuncio, {
    urls,
    expiresAt: Date.now() + CACHE_IMAGENS_TTL_MS,
  });
};

const invalidarCacheImagens = (idAnuncio) => {
  cacheImagensPorAnuncio.delete(idAnuncio);
};

const obterExtensao = (mimetype) => {
  switch (mimetype) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
};

const getStorageConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "marketplace-images";

  if (!supabaseUrl || !supabaseKey) {
    const err = new Error("Storage nao configurada. Define SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no backend.");
    err.code = "STORAGE_NAO_CONFIGURADA";
    throw err;
  }

  return {
    client: createClient(supabaseUrl, supabaseKey),
    bucket,
  };
};

const uploadImagensAnuncio = async (idAnuncio, idUtilizador, ficheiros) => {
  const { client, bucket } = getStorageConfig();

  const urls = await Promise.all(
    ficheiros.map(async (file, index) => {
      const ext = obterExtensao(file.mimetype);
      const nome = `${Date.now()}-${idUtilizador || "user"}-${index + 1}.${ext}`;
      const caminho = `marketplace/${idAnuncio}/${nome}`;

      const { error } = await client.storage
        .from(bucket)
        .upload(caminho, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new Error(`Erro no upload da imagem: ${error.message}`);
      }

      const { data } = client.storage.from(bucket).getPublicUrl(caminho);
      return data.publicUrl;
    })
  );

  invalidarCacheImagens(idAnuncio);

  return urls;
};

const listarImagensAnuncio = async (idAnuncio) => {
  const emCache = obterCacheImagens(idAnuncio);
  if (emCache) {
    return emCache;
  }

  const { client, bucket } = getStorageConfig();
  const pasta = `marketplace/${idAnuncio}`;

  const { data, error } = await client.storage.from(bucket).list(pasta, {
    limit: 20,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !Array.isArray(data)) {
    guardarCacheImagens(idAnuncio, []);
    return [];
  }

  const urls = data
    .filter((item) => item && typeof item.name === "string")
    .map((item) => client.storage.from(bucket).getPublicUrl(`${pasta}/${item.name}`).data.publicUrl);

  guardarCacheImagens(idAnuncio, urls);
  return urls;
};

const removerImagensAnuncio = async (idAnuncio) => {
  const { client, bucket } = getStorageConfig();
  const pasta = `marketplace/${idAnuncio}`;

  const { data, error } = await client.storage.from(bucket).list(pasta, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !Array.isArray(data) || data.length === 0) {
    return;
  }

  const caminhos = data
    .filter((item) => item && typeof item.name === "string")
    .map((item) => `${pasta}/${item.name}`);

  if (caminhos.length > 0) {
    await client.storage.from(bucket).remove(caminhos);
  }

  invalidarCacheImagens(idAnuncio);
};

const substituirImagensAnuncio = async (idAnuncio, idUtilizador, ficheiros) => {
  await removerImagensAnuncio(idAnuncio);
  return uploadImagensAnuncio(idAnuncio, idUtilizador, ficheiros);
};

module.exports = {
  uploadImagensAnuncio,
  listarImagensAnuncio,
  substituirImagensAnuncio,
};
