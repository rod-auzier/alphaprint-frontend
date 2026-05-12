import React, { createContext, useState, useContext } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  const adicionarItem = (produto, variacao, urlArte = '') => {
  const itemExistente = itens.find(
    (item) => item.produto._id === produto._id && item.variacao?.nome === variacao?.nome
   );

   if (itemExistente) {
    setItens(itens.map((item) =>
      item.produto._id === produto._id && item.variacao?.nome === variacao?.nome
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
     ));
   } else {
    setItens([...itens, { produto, variacao, quantidade: 1, urlArte }]);
   }
 };

  const removerItem = (produtoId, variacaoNome) => {
    setItens(itens.filter(
      (item) => !(item.produto._id === produtoId && item.variacao?.nome === variacaoNome)
    ));
  };

  const atualizarQuantidade = (produtoId, variacaoNome, quantidade) => {
    if (quantidade <= 0) {
      removerItem(produtoId, variacaoNome);
      return;
    }
    setItens(itens.map((item) =>
      item.produto._id === produtoId && item.variacao?.nome === variacaoNome
        ? { ...item, quantidade }
        : item
    ));
  };

  const limparCarrinho = () => setItens([]);

  const total = itens.reduce((acc, item) => {
    const preco = item.variacao ? item.variacao.preco : item.produto.preco;
    return acc + preco * item.quantidade;
  }, 0);

  return (
    <CarrinhoContext.Provider value={{
      itens,
      adicionarItem,
      removerItem,
      atualizarQuantidade,
      limparCarrinho,
      total
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}