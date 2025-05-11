# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password, data['password']):
        return jsonify({
            'message': 'Login successful',
            'user': {
                'name': user.name,
                'email': user.email
            }
        })
    return jsonify({'error': 'Invalid credentials'}), 401

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)






























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
















# app.py
import stripe
from flask import Flask, jsonify, request

stripe.api_key = 'your_stripe_secret_key'

# Order Model
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    payment_intent = db.Column(db.String(200))

# Payment Routes
@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = request.json
        intent = stripe.PaymentIntent.create(
            amount=int(data['amount'] * 100),  # Convert to cents
            currency='usd'
        )
        
        # Create order in database
        order = Order(
            user_id=data['user_id'],
            total=data['amount'],
            payment_intent=intent.id
        )
        db.session.add(order)
        db.session.commit()

        return jsonify({
            'clientSecret': intent.client_secret,
            'order_id': order.id
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/payment-success', methods=['POST'])
def payment_success():
    data = request.json
    order = Order.query.filter_by(payment_intent=data['payment_intent']).first()
    if order:
        order.status = 'completed'
        db.session.commit()
        return jsonify({'message': 'Payment successful'})
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/orders/<user_id>', methods=['GET'])
def get_orders(user_id):
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': order.id,
        'total': order.total,
        'status': order.status,
        'date': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for order in orders])




























# app.py - Add these new routes and models

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    avatar_url = db.Column(db.String(200))
    bio = db.Column(db.Text)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    store_name = db.Column(db.String(100))
    is_seller = db.Column(db.Boolean, default=False)

class SellerStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    total_sales = db.Column(db.Float, default=0)
    total_orders = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0)
    products_count = db.Column(db.Integer, default=0)

@app.route('/api/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    user = User.query.get_or_404(user_id)
    profile = Profile.query.filter_by(user_id=user_id).first()
    
    if profile.is_seller:
        stats = SellerStats.query.filter_by(seller_id=user_id).first()
        recent_orders = Order.query.filter_by(seller_id=user_id)\
                                 .order_by(Order.created_at.desc())\
                                 .limit(5).all()
        return jsonify({
            'profile': {
                'name': user.name,
                'email': user.email,
                'store_name': profile.store_name,
                'avatar_url': profile.avatar_url,
                'bio': profile.bio
            },
            'stats': {
                'total_sales': stats.total_sales,
                'total_orders': stats.total_orders,
                'rating': stats.rating,
                'products_count': stats.products_count
            },
            'recent_orders': [{
                'id': order.id,
                'amount': order.total,
                'status': order.status,
                'date': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for order in recent_orders]
        })
    else:
        recent_orders = Order.query.filter_by(user_id=user_id)\
                                 .order_by(Order.created_at.desc())\
                                 .limit(5).all()
        return jsonify({
            'profile': {
                'name': user.name,
                'email': user.email,
                'avatar_url': profile.avatar_url
            },
            'recent_orders': [{
                'id': order.id,
                'amount': order.total,
                'status': order.status,
                'date': order.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for order in recent_orders]
        })

@app.route('/api/profile/update', methods=['POST'])
def update_profile():
    data = request.json
    profile = Profile.query.filter_by(user_id=data['user_id']).first()
    
    for key, value in data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})
