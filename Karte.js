const A = "Puerto Montt";
const B = "Playa Pucatrihue";
let targetCor = [];
let route = [];

const key = '5b3ce3597851110001cf62485ee1afa419994d2fb32977a21838312f';
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
    var map = L.map('map').setView(new L.LatLng(route[0][0],route[0][1]), 12);
    var bounds = map.getBounds();
    console.log(bounds);
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();
    console.log(southWest);
    console.log(northEast);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    var autoIcon = L.icon({ iconUrl: 'icon_auto.png', iconSize: [38, 30] }); // Pfad zu Ihrem Auto-Icon
    var marker = L.marker(route[0], {icon: autoIcon, rotationAngle: 0}).addTo(map);
    var i = 0;
    var angle = 0;

    function angleBetweenVectors(a, b) {
        const Dot = math.dot(a,b);
        const magA = math.norm(a);
        const magB = math.norm(b);
        const cosAngle = Dot / (magA * magB);
        return Math.acos(cosAngle) * (180 / Math.PI); // Ergebnis in Grad
    }

    function toRadians(degrees) {
        return degrees * (Math.PI / 180);
      }
    function toDegree(radian) {
        return  radian*(180 / Math.PI);
    }
      
    function convertGeoToSpherical(latitude, longitude) {
        // Umwandlung des Breitengrades in den Polarwinkel theta
        let theta = toRadians(90 - latitude);
        // Der Längengrad bleibt gleich, muss aber in Radiant umgewandelt werden
        let phi = toRadians(longitude);
      
        return {theta, phi };
    }

    function polar(radius, phi) {
        return [radius*Math.cos(phi),radius*Math.sin(phi)];
    }
      
    // Beispiel: Umwandlung für Berlin (52.5200° N, 13.4050° E)
    const { theta, phi } = convertGeoToSpherical(-41.455636, -72.936745);
    console.log(`Theta: ${toDegree(theta)}, Phi: ${toDegree(phi)}`);
      
    function moveAuto() {
        if (i < route.length) {
            map.setView(new L.LatLng(route[i][0], route[i][1]), map.getZoom());
            marker.setLatLng(new L.LatLng(route[i][0], route[i][1]));
            let {theta , phi} = convertGeoToSpherical(route[i][0],route[i][1]);
            let {theta1, phi1} = convertGeoToSpherical(route[i+1][0],route[i+1][1])
            let m = 2*6371*Math.tan(theta/2);
            let m1 = 2*6371*Math.tan(theta1/2);
            console.log("alpha="+toDegree(phi)+","+"r="+m);
            let r_n  =  math.subtract(polar(m1,phi1),polar(m,phi));            
            angle = angleBetweenVectors(r_n,[0,1]);
            console.log(angle);
            setTimeout(marker.setRotationAngle(angle),100);
            i++;
            setTimeout(moveAuto, 1000); // Bewegt das Auto jede Sekunde
        }
    }
    moveAuto();
}
showMapAnimation();
