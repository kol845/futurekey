
async function postMessage(e){
    // axios.get('localhost:5000/api/messages')
    //     .then(function (response) {
    //         // handle success
    //         console.log(response);
    //     })
    //     .catch(function (error) {
    //         // handle error
    //         console.log(error);
    //     })
    //     .then(function () {
    //         // always executed
    // });
    // console.log("POSTED!");
    e.preventDefault();
    // window.location.replace("./post.html");
    const url = 'http://localhost:5000/api/message'
    await fetch(url,{
        method:'POST',
        body:{
            email:'pebo-hamza@hotmail.com',
            passwd:'Test through frontend',
            send_time:'1602942846'
        }
    });

    



}
