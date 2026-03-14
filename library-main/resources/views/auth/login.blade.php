<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login | CampusMart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            height: 100vh;
            background: linear-gradient(to right, #e9f5ec, #d8f3dc);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Poppins', sans-serif;
        }
        .card {
            background: white;
            width: 380px;
            padding: 35px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        .icon { font-size: 40px; color: #2d6a4f; margin-bottom: 10px; }
        h2 { margin-bottom: 25px; color: #1b4332; }
        input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border-radius: 10px;
            border: 1px solid #ccc;
            outline: none;
            font-size: 14px;
        }
        .password-box { position: relative; }
        .password-box i {
            position: absolute;
            right: 12px;
            top: 40%;
            transform: translateY(-50%);
            cursor: pointer;
            color: #555;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #2d6a4f;
            border: none;
            color: white;
            border-radius: 30px;
            font-size: 16px;
            cursor: pointer;
            transition: 0.3s;
        }
        button:hover { background: #1b4332; }
        .link { margin-top: 15px; font-size: 14px; }
        .link a { color: #2d6a4f; text-decoration: none; font-weight: 500; }
        
        /* Error & Success Messages */
        .alert {
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 13px;
        }
        .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    </style>
</head>
<body>

<div class="card">
    <div class="icon"><i class="fas fa-book-reader"></i></div>
    <h2>Login</h2>

    @if(session('error'))
        <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i> {{ session('error') }}
        </div>
    @endif

    @if(session('success'))
        <div class="alert alert-success">
            <i class="fas fa-check-circle"></i> {{ session('success') }}
        </div>
    @endif

    <form method="POST" action="{{ route('login') }}">
        @csrf
        <input type="email" name="email" placeholder="Email" required value="{{ old('email') }}">

        <div class="password-box">
            <input type="password" name="password" id="password" placeholder="Password" required>
            <i class="fas fa-eye" onclick="togglePassword()"></i>
        </div>

        <button type="submit">LOGIN</button>
    </form>

    <div class="link">
        Don’t have an account? <a href="{{ route('register') }}">Sign up</a>
    </div>
</div>

<script>
    function togglePassword() {
        const pass = document.getElementById('password');
        pass.type = pass.type === 'password' ? 'text' : 'password';
    }
</script>

</body>
</html>