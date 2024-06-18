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
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-4">POS System</h1>
      <div className="mb-4">
        <input
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="バーコードを入力"
          className="w-full px-3 py-2 border rounded"
        />
        <button onClick={handleLookup} className="w-full mt-2 bg-blue-500 text-white py-2 rounded">
          商品を検索
        </button>
      </div>
      {product && (
        <div className="mb-4 p-4 border rounded">
          <p>商品名: {product.name}</p>
          <p>価格: ¥{product.price}</p>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full px-3 py-2 border rounded mt-2"
          />
          <button onClick={handleAddToCart} className="w-full mt-2 bg-green-500 text-white py-2 rounded">
            リストに追加
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-2">購入リスト</h2>
      <ul className="mb-4">
        {cart.map(item => (
          <li key={item.product_id} className="mb-2 p-2 border rounded">
            {item.name} - ¥{item.price} x {item.quantity} = ¥{item.price * item.quantity}
            <button onClick={() => handleRemoveFromCart(item.product_id)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">
              リスト削除
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleUpdateQuantity(item.product_id, parseInt(e.target.value))}
              className="w-16 px-2 py-1 border rounded ml-2"
            />
            <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity)} className="ml-2 bg-blue-500 text-white px-2 py-1 rounded">
              数量更新
            </button>
          </li>
        ))}
      </ul>
      <h3 className="text-lg font-semibold">合計: ¥{cart.reduce((total, item) => total + item.price * item.quantity, 0)}</h3>
      <button onClick={handlePurchase} className="w-full mt-4 bg-purple-500 text-white py-2 rounded">
        購入
      </button>
    </div>
  );
};

export default PosSystem;
