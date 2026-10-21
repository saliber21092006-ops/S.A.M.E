<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta content="text/html;charset=UTF-8">
    <title>
        S.A.M.E
    </title>
</head>

<body>
    <div class="container">
        <h1>S.A.M.E</h1>
        <p>SOCRATIC AI MATH ENGINE</p>

        <div class="auth-buttons">
            <a href="/auth/login" class="btn btn-outline">Login</a>
            <a href="/auth/sign_up" class="btn btn-solid">Sign up</a>
        </div>
    </div>
</body>
</html>


<style>
    *{
        margin: 0;
        padding: 0;
    }

    body{
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @property --angle{
        syntax: "<angle>";
        initial-value: 0deg;
        inherits: false;
    }

    .container{
        text-align: center;
        border: 2px solid transparent;
        border-radius: 5px;
        padding: 20px;
        background: 
            linear-gradient(#fff, #fff) padding-box, 
            conic-gradient(
                from var(--angle),
                #1f2a44 0 15%,
                rgba(31, 42, 68, .15) 15% 50%,
                #1f2a44 50% 65%,
                rgba(31, 42, 68, .15) 65% 100%
            ) border-box;
        animation: spin-border 3s linear infinite;
    }

    @keyframes spin-border{
        to { --angle: 360deg; }
    }

    h1{
        color: #1c166bd9;
        font-weight: bold;
        font-size: 60px;
    }

    p{
        font-weight: bold;
        letter-spacing: 1px;
    }

    .auth-buttons{
        display: flex;
        gap: 14px;
        padding-top: 10px;
    }

    .btn{
        min-width: 130px;
        padding: 12px 24px;
        border-radius: 8px;
        border: 2px solid #1f2a44;
        font: 600 15px/1 Georgia, serif;
        letter-spacing: .05rem;
        text-align: center;
        text-decoration: none;
        transition: transform .15s, background .2s, color .2s;
    }

    .btn:hover {transform: translateY(-2px)}
    .btn-outline{color: #1f2a44; background: transparent;}
    .btn-outline:hover {
        background: #1f2a44;
        color: #fff;
    }

    .btn-solid{
        color: #fff;
        background: #1f2a44;
    }
    .btn-solid:hover{
        background: #3b4a8c;
        border-color: #3b4a8c;
    }

    @media (max-width: 400px){
        .auth-buttons {flex-direction: column; width: 80%}
    }
</style>