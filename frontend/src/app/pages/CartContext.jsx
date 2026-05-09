import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
const CartContext = createContext({});
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const adicionarAoCarrinho = (item) => {
    let adicionado = false;
    setItems((prev) => {
      const temConflitoDatas = prev.some((i) => {
        if (i.id_anuncio === item.id_anuncio) {
          const inicioExistente = new Date(i.datainicio);
          const fimExistente = new Date(i.datafim);
          const inicioNovo = new Date(item.datainicio);
          const fimNovo = new Date(item.datafim);
          return inicioNovo <= fimExistente && fimNovo >= inicioExistente;
        }
        return false;
      });
      if (temConflitoDatas) {
        toast.error("Este figurino j\xE1 se encontra no carrinho com datas sobrepostas.");
        return prev;
      }
      const newItem = { ...item, cartItemId: `${item.id_anuncio}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
      adicionado = true;
      return [...prev, newItem];
    });
    return adicionado;
  };
  const removerDoCarrinho = (cartItemId) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };
  const limparCarrinho = () => {
    setItems([]);
  };
  return <CartContext.Provider value={{ items, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, totalItems: items.length }}>
      {children}
    </CartContext.Provider>;
}
function useCart() {
  return useContext(CartContext);
}
export {
  CartProvider,
  useCart
};
