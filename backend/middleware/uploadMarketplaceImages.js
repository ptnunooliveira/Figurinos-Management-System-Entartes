const multer = require("multer");

const MAX_IMAGENS = 5;
const MAX_IMAGEM_BYTES = 2 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    files: MAX_IMAGENS,
    fileSize: MAX_IMAGEM_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }

    cb(new Error("Apenas ficheiros de imagem sao permitidos."));
  },
});

const uploadMarketplaceImages = [
  upload.array("imagens", MAX_IMAGENS),
  (req, res, next) => {
    try {
      req.marketplaceImageFiles = req.files || [];
      next();
    } catch (error) {
      return res.status(400).json({ error: error.message || "Erro ao processar imagens." });
    }
  },
];

module.exports = {
  uploadMarketplaceImages,
  MAX_IMAGENS,
  MAX_IMAGEM_BYTES,
};
