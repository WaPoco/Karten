import {chileBoundary} from './chileBoundary.js';
let targetCor = [];
let route = [];
let map;
let A, B;
const button = document.getElementById("ready");

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
    await Promise.all([await getCoordinate(A),await getCoordinate(B)]);
    const urlToFetch = `https://api.openrouteservice.org/v2/directions/driving-car${requestParams}&start=${targetCor[0]}&end=${targetCor[1]}`;
    const response = await fetch(urlToFetch, header);
    if(response.ok) {
        const jsonResponse = await response.json();
        jsonResponse['features'][0]['geometry']['coordinates'].forEach((element) =>{
            route.push([element[1],element[0]]);
        });
    }
};
function toDegree(radian) {
    return  radian*(180 / Math.PI);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function angleBetweenVectors(a, b) {
    const a_new = [a[1],a[0]];
    const Dot = math.dot(a_new,b);
    const magA = math.norm(a);
    const magB = math.norm(b);
    const cosAngle = Dot / (magA * magB);
    const sign = a_new[0]>0 ? 1 : -1;
    const angle = sign*Math.acos(cosAngle);
    return toDegree(angle); // Ergebnis in Grad
}
/*
--Dieser Teil sollte die Landesgrenzen von Chile auf der Karte in Rot markieren.--

const Intro = async () => {
    return new Promise((resolve)=>{
        setTimeout(() => {
            chileBoundary.forEach((element)=>{
            element.forEach((e)=>{
                let chileBoundary_swap = [];
                e.forEach((m)=> { 
                    chileBoundary_swap.push([m[1],m[0]]);
                    });
                var polyline = L.polyline(chileBoundary_swap, {color: 'red'}).addTo(map);
                });
            });
            resolve();
        },3000);
    });

}
*/
const Zoom = async (i) => {
    return new Promise((resolve)=>{
        setTimeout(()=>{
            map.setView(new L.LatLng(route[0][0], route[0][1]), i);
            resolve(); 
        },250);
        });
    }

const showMapAnimation = async() => {
    //await Intro();
    map = L.map('map').setView(new L.LatLng(0,0),2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    await getRoute();
    for(let i = 5; i<=12;i++) {
        await Zoom(i);
    }
    var autoIcon = L.icon({ iconUrl: 'icon_auto.png', iconSize: [38, 30] }); // Pfad zu Ihrem Auto-Icon
    var marker = L.marker(route[0], {icon: autoIcon, rotationAngle: 0}).addTo(map);
    var i = 0;
    var angle = 0;

      
    function moveAuto() {
        if (i < route.length) {
            map.setView(new L.LatLng(route[i][0], route[i][1]), map.getZoom());
            marker.setLatLng(new L.LatLng(route[i][0], route[i][1]));
            let r_n  =  math.subtract(route[i+1],route[i]);
            angle = angleBetweenVectors(r_n,[0,1]);
            marker.setRotationAngle(angle);
            i++;
            setTimeout(moveAuto, 25); // Bewegt das Auto jede Sekunde
        } else {
            return;
        }
    }
    moveAuto();
}

function Animation () {
    A = document.getElementById("Start").value;
    B = document.getElementById("End").value;
    showMapAnimation();
}


button.addEventListener('click',Animation);



