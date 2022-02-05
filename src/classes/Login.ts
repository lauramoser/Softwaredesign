//Login, checks if User is included in Database 

let vNameString: string;

async function handlePrüfen(): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let url: string = "http://localhost:8100";
    let query: URLSearchParams = new URLSearchParams(<any> formData);
    url = url + "/login" + "?" + query.toString();    
    vNameString = (<HTMLInputElement>document.getElementById("vnameID")).value;

    localStorage.setItem("vorname", vNameString);
    let antwort: Response = await fetch(url, { method: "get" });
    let antwort2: string = await antwort.text(); 
  
    if (antwort2 == "true") {
        localStorage.setItem("x", "true");
        window.location.href = "http://127.0.0.1:5500/Endabgabe/Chatrooms.html";
    }
    //Benutzername existier aber Passwort ist falsch--> einfügen
    else if (antwort2 == "false") {
        localStorage.setItem("x", "false");
        alert("Du hast keinen gültigen Account");
    }
}