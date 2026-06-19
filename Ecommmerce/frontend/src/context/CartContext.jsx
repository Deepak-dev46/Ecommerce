import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext({
  cartItems: {},
  addProduct: () => {},
  removeProduct: () => {},
  clearCart: () => {},
  itemCount: 0,
  total: 0,
})

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({})

  const addProduct = (product) => {
    setCartItems((previousCart) => {
      const item = previousCart[product.id]

      if (item) {
        return {
          ...previousCart,
          [product.id]: {
            ...item,
            quantity: item.quantity + 1,
          },
        }
      }

      return {
        ...previousCart,
        [product.id]: { ...product, quantity: 1 },
      }
    })
  }

  const removeProduct = (productId) => {
    setCartItems((previousCart) => {
      const item = previousCart[productId]
      if (!item) {
        return previousCart
      }

      if (item.quantity === 1) {
        const { [productId]: removed, ...rest } = previousCart
        return rest
      }

      return {
        ...previousCart,
        [productId]: {
          ...item,
          quantity: item.quantity - 1,
        },
      }
    })
  }

  const clearCart = () => {
    setCartItems({})
  }

  const itemCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const total = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  )

  const value = useMemo(
    () => ({
      cartItems,
      addProduct,
      removeProduct,
      clearCart,
      itemCount,
      total,
    }),
    [cartItems],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
