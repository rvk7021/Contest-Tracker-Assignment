exports.contestEmail = (userName, contests) => {
    const contestList = contests
        .map(
            (contest) =>
                `<li><strong>${contest.name}</strong> - <a href="${contest.link}" class="cta">Join Now</a></li>`
        )
        .join("");

    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Upcoming Contests Notification</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
            }
    
            .cta {
                display: inline-block;
                padding: 8px 15px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 14px;
                font-weight: bold;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <div class="message">Upcoming Contests Just for You!</div>
            <div class="body">
                <p>Dear ${userName},</p>
                <p>Here are some upcoming contests you haven’t been notified about yet:</p>
                <ul>${contestList}</ul>
                <p>Make sure to participate and showcase your skills. Best of luck!</p>
            </div>
            <div class="support">
                If you have any questions, feel free to contact us at 
                <a href="mailto:sagar.2003kosi@gmail.com">sagar.2003kosi@gmail.com</a>.
            </div>
        </div>
    </body>
    
    </html>`;
};
