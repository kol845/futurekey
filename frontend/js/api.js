async function postMessage(e){
    e.preventDefault();
    const passwd = e.target.password.value;
    const email = e.target.email.value;
    const dt = new Date(e.target.date.value).getTime()

    
    const url = '/api/message'
    const promise = await fetch(url,{
        method:'POST',
        headers: {'Content-Type': 'application/json'},

        body: JSON.stringify({
                email:email,
                passwd:passwd,
                send_time:dt
            }),
    });
    window.location.href = "/post.html";


}
