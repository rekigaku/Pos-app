'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface Product {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

const PosSystem: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<Product[]>([]);

  const handleLookup = async () => {
    try {
      const response = await axios.get('http://localhost:8000/lookup', {
        params: { barcode },
      });
      setProduct({ ...response.data, quantity: 1 });
    } catch (error) {
      alert('Error fetching product');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const updatedCart = [...cart, { ...product, quantity }];
      setCart(updatedCart);
      setProduct(null);
      setBarcode('');
      setQuantity(1);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    const updatedCart = cart.filter(item => item.product_id !== productId);
    setCart(updatedCart);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    const updatedCart = cart.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  const handlePurchase = async () => {
    try {
      const transaction = {
        emp_cd: 'E001',
        store_cd: 'S001',
        pos_no: 'P001',
        total_amt: cart.reduce((total, item) => total + item.price * item.quantity, 0),
        ttl_amt_ex_tax: cart.reduce((total, item) => total + item.price * item.quantity / 1.1, 0),
        products: cart.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
      };
      await axios.post('http://localhost:8000/transactions', transaction);
      setCart([]);
      alert('Purchase successful');
    } catch (error) {
      alert('Purchase failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-6 border-t-4 border-cyan-500">
      <h1 className="text-3xl font-bold text-cyan-600 mb-6">POS System</h1>
      <div className="mb-4">
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="バーコードを入力"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleLookup}
          className="w-full mt-2 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded transition duration-300"
        >
          商品を検索
        </button>
      </div>
      {product && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <p className="font-semibold text-gray-700">商品名: {product.name}</p>
          <p className="text-gray-600">価格: ¥{product.price}</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded mt-2 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddToCart}
            className="w-full mt-2 bg-cyan-800 hover:bg-cyan-900 text-white py-2 rounded transition duration-300"
          >
            リストに追加
          </button>
        </div>
      )}
      <h2 className="text-2xl font-semibold text-cyan-600 mb-2">購入リスト</h2>
      <ul className="mb-4">
        {cart.map(item => (
          <li key={item.product_id} className="mb-2 p-4 border rounded bg-gray-50">
            <p className="text-gray-700">{item.name} - ¥{item.price} x {item.quantity} = ¥{item.price * item.quantity}</p>
            <div className="flex items-center mt-2">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value))}
                className="w-16 px-2 py-1 border rounded focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleUpdateQuantity(item.product_id, item.quantity)}
                className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition duration-300"
              >
                数量更新
              </button>
              <button
                onClick={() => handleRemoveFromCart(item.product_id)}
                className="ml-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded transition duration-300"
              >
                キャンセル
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h3 className="text-xl font-semibold text-cyan-600">合計: ¥{cart.reduce((total, item) => total + item.price * item.quantity, 0)}</h3>
      <button
        onClick={handlePurchase}
        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded transition duration-300"
      >
        購入
      </button>
    </div>
  );
};

export default PosSystem;
