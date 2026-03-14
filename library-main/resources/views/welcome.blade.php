<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome | CampusMart</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&display=swap" rel="stylesheet">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            height: 100vh;
            background: linear-gradient(to right, #b7e4c7, #95d5b2);
            display: flex;
            justify-content: center;
            align-items: center;
            color: #1b4332;
        }

        .container {
            text-align: center;
        }

        h1 {
            font-size: 60px;
            margin-bottom: 20px;
        }

        p {
            font-size: 20px;
        }

        .btn {
            margin-top: 90px;
            padding: 12px 30px;
            background: white;
            color: #2d6a4f;
            border-radius: 30px;
            text-decoration: none;
            cursor: pointer;
            border: none;
        }

        /* Modal */
        .modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(6px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: 0.3s ease;
        }

        .modal.active {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-box {
            background: white;
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            transform: scale(0.8);
            transition: 0.3s ease;
        }

        .modal.active .modal-box {
            transform: scale(1);
        }

        .modal-box a {
            display: block;
            margin: 15px 0;
            padding: 12px;
            background: #2d6a4f;
            color: white;
            border-radius: 30px;
            text-decoration: none;
        }

        .close {
            margin-top: 10px;
            cursor: pointer;
            color: #555;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>WELCOME</h1>
    <p>Welcome to CAMPUSMART</p>
    <button class="btn" onclick="openModal()">Get Started</button>
</div>

<div class="modal" id="modal">
    <div class="modal-box">
        <a href="{{ route('login') }}">LOGIN</a>
        <a href="{{ route('register') }}">SIGN UP</a>
        <div class="close" onclick="closeModal()">Cancel</div>
    </div>
</div>

<script>
    function openModal() {
        document.getElementById('modal').classList.add('active');
    }

    function closeModal() {
        document.getElementById('modal').classList.remove('active');
    }
</script>

</body>
</html>