const url = 'http://localhost:3000/auth/signup';

const options=(method,body)=>{
        return {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        };
}
export async function RequestServer(body,method) {

  try {
    let response;
    if(method==="GET")
     method= await fetch(url);
    else if(method==="POST"){
        response= await fetch(url, options(method,body));
    }
    else{
        console.log("in else")
        response= await fetch(url, options(method,body));
    }
    let data = await response.json();
  } catch (error) {
    console.log(error);
  }
}