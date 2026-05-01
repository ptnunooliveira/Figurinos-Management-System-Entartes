import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  cartItemId: string; // ID único para o item no carrinho
  id_anuncio: number;
  figurino_nome: string;
  datainicio: string;
  datafim: string;
  imagem_url?: string;
}

// Omitimos o cartItemId ao adicionar, pois ele será gerado internamente
type AddToCartItem = Omit<CartItem, 'cartItemId'>;

interface CartContextData {
  items: CartItem[];
  adicionarAoCarrinho: (item: AddToCartItem) => void;
  removerDoCarrinho: (cartItemId: string) => void;
  limparCarrinho: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const adicionarAoCarrinho = (item: AddToCartItem) => {
    setItems((prev) => {
      // Evitar adicionar o mesmo anúncio com datas sobrepostas no carrinho
      const temConflitoDatas = prev.some(i => {
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
        toast.error("Este figurino já se encontra no carrinho com datas sobrepostas.");
        return prev;
      }
      const newItem: CartItem = { ...item, cartItemId: `${item.id_anuncio}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` };
      return [...prev, newItem];
    });
  };

  const removerDoCarrinho = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const limparCarrinho = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, totalItems: items.length }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}