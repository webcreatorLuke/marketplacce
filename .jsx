// pages/index.js
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold">MyMarketplace</div>
            <div className="flex space-x-4">
              <a href="/shop" className="hover:text-blue-500">Shop</a>
              <a href="/sell" className="hover:text-blue-500">Sell</a>
              <a href="/login" className="hover:text-blue-500">Login</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Buy and Sell with Confidence
          </h1>
          <p className="text-xl mb-8">
            Your trusted marketplace for quality products
          </p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold">
            Start Shopping
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold">Product Name</h3>
              <p className="text-gray-600">$99.99</p>
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

















# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import jwt
import os

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marketplace.db'
app.config['SECRET_KEY'] = 'your-secret-key'
db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_seller = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    products = db.relationship('Product', backref='seller', lazy=True)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(200))
    stock = db.Column(db.Integer, default=0)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)

# API Routes
@app.route('/api/products', methods=['GET', 'POST'])
def products():
    if request.method == 'GET':
        products = Product.query.all()
        return jsonify([{
            'id': p.id,
            'name': p.name,
            'price': p.price,
            'description': p.description,
            'image_url': p.image_url,
            'stock': p.stock,
            'seller': p.seller.name
        } for p in products])
    
    if request.method == 'POST':
        data = request.json
        new_product = Product(
            name=data['name'],
            description=data['description'],
            price=data['price'],
            image_url=data['image_url'],
            stock=data['stock'],
            seller_id=data['seller_id']
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify({'message': 'Product added successfully'}), 201

@app.route('/api/cart', methods=['GET', 'POST', 'DELETE'])
def cart():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        cart_items = Cart.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': item.id,
            'product': Product.query.get(item.product_id).name,
            'quantity': item.quantity,
            'price': Product.query.get(item.product_id).price
        } for item in cart_items])

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)




















// pages/products/[id].js - Product Details Page
export default function ProductDetails() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="bg-white p-4 rounded-lg">
          <div className="bg-gray-200 h-96 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="bg-gray-200 h-20 rounded cursor-pointer"></div>
            <div className="bg-gray-200 h-20 rounded cursor-pointer"></div>
            <div className="bg-gray-200 h-20 rounded cursor-pointer"></div>
            <div className="bg-gray-200 h-20 rounded cursor-pointer"></div>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">Product Name</h1>
          <p className="text-2xl text-blue-600 mb-4">$99.99</p>
          <div className="mb-6">
            <h2 className="font-bold mb-2">Description</h2>
            <p className="text-gray-600">
              Detailed product description goes here. This is a great product that
              you'll love to use every day.
            </p>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg mb-4">
            Add to Cart
          </button>
          <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  )
}

// pages/login.js - Login Page
export default function Login() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        
        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2"/>
              Remember me
            </label>
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

























// components/Navigation.js
export default function Navigation() {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">MyMarketplace</span>
          </a>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl px-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-2">
                🔍
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <a href="/shop" className="hover:text-blue-500">Shop</a>
            <a href="/sell" className="hover:text-blue-500">Sell</a>
            <a href="/cart" className="hover:text-blue-500">Cart (0)</a>
            <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Login
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
























// App.js
import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <>
          {!showSignup ? (
            <Login 
              setIsLoggedIn={setIsLoggedIn}
              setCurrentUser={setCurrentUser}
              setShowSignup={setShowSignup}
            />
          ) : (
            <Signup 
              setShowSignup={setShowSignup}
            />
          )}
        </>
      ) : (
        <Dashboard 
          user={currentUser}
          setIsLoggedIn={setIsLoggedIn}
        />
      )}
    </div>
  );
}

export default App;
























// components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ setIsLoggedIn, setCurrentUser, setShowSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for owner login
    if (email === 'leeret12@yahoo.com' && password === '0413') {
      setCurrentUser({ name: 'Owner', email });
      setIsLoggedIn(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      setCurrentUser(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => setShowSignup(true)}>
        Need an account? Sign up
      </button>
    </div>
  );
}

export default Login;


















// components/CheckoutForm.js
import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/stripe-js';

function CheckoutForm({ amount, userId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        try {
            // Create payment intent
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, user_id: userId })
            });
            const data = await response.json();

            // Complete payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)
                }
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                // Notify backend of success
                await fetch('/api/payment-success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        payment_intent: result.paymentIntent.id
                    })
                });
                
                window.location.href = '/order-confirmation';
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <h2>Payment Details</h2>
            <div className="card-element">
                <CardElement />
            </div>
            {error && <div className="error">{error}</div>}
            <button disabled={processing}>
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
}

// components/OrderHistory.js
function OrderHistory({ userId }) {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`/api/orders/${userId}`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    return (
        <div className="order-history">
            <h2>Order History</h2>
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className="order-item">
                        <div>Order #{order.id}</div>
                        <div>${order.total}</div>
                        <div className={`status ${order.status}`}>
                            {order.status}
                        </div>
                        <div>{order.date}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}



















// App.js
import { Elements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('your_publishable_key');

function App() {
    return (
        <Elements stripe={stripePromise}>
            {/* Your app components */}
        </Elements>
    );
}





















// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function Dashboard({ userId }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch(`/api/dashboard/${userId}`);
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-sidebar">
                <div className="user-info">
                    <img 
                        src={dashboardData?.profile.avatar_url} 
                        alt="Profile" 
                        className="avatar"
                    />
                    <h3>{dashboardData?.profile.name}</h3>
                </div>
                
                <nav className="dashboard-nav">
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                    </button>
                    <button 
                        className={activeTab === 'profile' ? 'active' : ''}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    {dashboardData?.profile.is_seller && (
                        <button 
                            className={activeTab === 'seller' ? 'active' : ''}
                            onClick={() => setActiveTab('seller')}
                        >
                            Seller Dashboard
                        </button>
                    )}
                </nav>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && <DashboardOverview data={dashboardData} />}
                {activeTab === 'orders' && <OrdersPanel orders={dashboardData?.recent_orders} />}
                {activeTab === 'profile' && <ProfileEditor profile={dashboardData?.profile} />}
                {activeTab === 'seller' && <SellerDashboard stats={dashboardData?.stats} />}
            </div>
        </div>
    );
}

// components/DashboardOverview.js
function DashboardOverview({ data }) {
    return (
        <div className="dashboard-overview">
            <h2>Welcome back, {data?.profile.name}!</h2>
            
            {data?.stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Sales</h3>
                        <p>${data.stats.total_sales}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Orders</h3>
                        <p>{data.stats.total_orders}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Rating</h3>
                        <p>{data.stats.rating} ⭐</p>
                    </div>
                </div>
            )}

            <div className="recent-orders">
                <h3>Recent Orders</h3>
                <div className="orders-list">
                    {data?.recent_orders.map(order => (
                        <div key={order.id} className="order-item">
                            <span>Order #{order.id}</span>
                            <span>${order.amount}</span>
                            <span className={`status ${order.status}`}>
                                {order.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// components/ProfileEditor.js
function ProfileEditor({ profile }) {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        email: profile?.email || '',
        bio: profile?.bio ||