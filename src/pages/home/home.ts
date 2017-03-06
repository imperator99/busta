import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';

import { NavController } from 'ionic-angular';
import { Geolocation, Geoposition, BackgroundGeolocation } from 'ionic-native';

import 'rxjs/add/operator/filter';

declare var google;

@Component({
	selector: 'home-page',
	templateUrl: 'home.html'
})
export class HomePage {

	@ViewChild('map') mapElement: ElementRef;
	map: any;
	public watch: any;
	public lat: number = 0;
	public lng: number = 0;
	public userMarker: any;
	public zone: NgZone;

	constructor(public navCtrl: NavController) {

	}

	ionViewDidLoad() {
		console.log('ViewLoaded');
		this.loadMap();
		this.watchUser();
	}

	loadMap() {
		console.log('Setting up map...');

		Geolocation.getCurrentPosition().then((position) => {
			let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

			let mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}

			this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

			this.userMarker = new google.maps.Marker({
				map: this.map,
				position: this.map.getCenter(),
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 5
				}
			});

		}, (err) => {
			console.log(err);
		});
	}

	watchUser() {
		let config = {
			desiredAccuracy: 0,
			stationaryRadius: 20,
			distanceFilter: 10,
			debug: true,
			interval: 2000
		};

		BackgroundGeolocation.configure((location) => {
			
			console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
			
			// Run update inside of Angular's zone
			this.zone.run(() => {
				this.lat = location.latitude;
				this.lng = location.longitude;
			});
			
		}, (err) => {
			
			console.log(err);
			
		}, config);
		
		// Turn ON the background-geolocation system.
		BackgroundGeolocation.start();

		let options = {
			frequency: 3000, 
			enableHighAccuracy: true
		};

		this.watch = Geolocation.watchPosition(options).filter((p: any) => 
			p.code === undefined).subscribe((position: Geoposition) => {
				console.log(position);
				let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				this.userMarker.setPosition(latLng);
				this.map.setCenter(latLng);
			});
		}

		addMarker() {
			let marker = new google.maps.Marker({
				map: this.map,
				animation: google.maps.Animation.DROP,
				position: this.map.getCenter()
			});

			let content = "<h4>Information!</h4>";

			this.addInfoWindow(marker, content);
		}

		addInfoWindow(marker, content) {
			let infoWindow = new google.maps.InfoWindow({
				content: content
			});

			google.maps.event.addListener(marker, 'click', () => {
				infoWindow.open(this.map, marker);
			});
		}

		locateUser() {
			Geolocation.getCurrentPosition().then((position) => {
				
				let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

				this.map.panTo(latLng);

			}, (err) => {
				console.log(err);
			});
		}
	}
