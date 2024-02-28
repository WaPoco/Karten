const request = () => new XMLHttpRequest();

const A = "Puerto Montt";
const B = "Playa Pucatrihue";
let targetCor = [];
let route = [];

const key = '';
const requestParams = `?api_key=${key}`;
const header = { method: 'GET', headers: {
    'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'}};

const getCoordinate = async (city) => {
    const urlToFetch = `https://api.openrouteservice.org/geocode/search${requestParams}&text=${encodeURIComponent(city)}`;
    const response = await fetch(urlToFetch, header);
    if(response.ok) {
        const jsonResponse = await response.json();
        targetCor.push(jsonResponse['features'][0]['geometry']['coordinates']);
    }
};

const getRoute = async () => {
    await Promise.all([getCoordinate(A),getCoordinate(B)]);
    const urlToFetch = `https://api.openrouteservice.org/v2/directions/driving-car${requestParams}&start=${targetCor[0]}&end=${targetCor[1]}`;
    const response = await fetch(urlToFetch, header);
    if(response.ok) {
        const jsonResponse = await response.json();
        jsonResponse['features'][0]['geometry']['coordinates'].forEach((element) =>{
            route.push([element[1],element[0]]);
        });
    }
};

const showMapAnimation = async() => {
    await getRoute();
    var map = L.map('map').setView(route[0], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var autoIcon = L.icon({ iconUrl: 'icon_auto.png', iconSize: [38, 30] }); // Pfad zu Ihrem Auto-Icon
    var marker = L.marker(route[0], {icon: autoIcon, rotationAngle: 0}).addTo(map);
    var i = 0;
    var angle = 0;

    function angleBetweenVectorsMathJS(a, b) {
        const Dot = math.dot(a,b);
        const magA = math.norm(a);
        const magB = math.norm(b);
        const cosAngle = Dot / (magA * magB);
        return Math.acos(cosAngle) * (180 / Math.PI); // Ergebnis in Grad
    }
    // Beispiel
    let vectorA = [0, 0];
    const vectorB = [-1, 0];
    console.log(angleBetweenVectorsMathJS(vectorA,vectorB));
    function moveAuto() {
        if (i < route.length) {
            map.setView(new L.LatLng(route[i][0], route[i][1]), map.getZoom());
            marker.setLatLng(new L.LatLng(route[i][0], route[i][1]));
            vectorA[0] = math.subtract(route[i+1], route[i])[0];
            vectorA[1] = math.subtract(route[i+1], route[i])[1];
            angle = vectorA[0]>0 ? angleBetweenVectorsMathJS(vectorA, vectorB)-180 : -angleBetweenVectorsMathJS(vectorA, vectorB)+180 ;
            console.log(angle);
            setTimeout(marker.setRotationAngle(angle),100);
            i++;
            setTimeout(moveAuto, 1000); // Bewegt das Auto jede Sekunde
        }
    }
    moveAuto();
}
showMapAnimation();
