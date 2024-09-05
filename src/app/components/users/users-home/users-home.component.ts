import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, Marker, GeoJSONSource, LngLatLike, Popup } from 'maplibre-gl';
import { Feature, LineString, Point, FeatureCollection, GeoJsonProperties } from 'geojson'; // Types only
import { DevicesService } from '../../../services/users/devices.service'

@Component({
  selector: 'app-users-home',
  templateUrl: './users-home.component.html',
  styleUrls: ['./users-home.component.css'],
})
export class UsersHomeComponent implements OnInit, AfterViewInit, OnDestroy {

  map: Map | undefined;
  center: any = [];
  style: any = `https://api.maptiler.com/maps/streets-v2/style.json?key=LckgwjJs1I0TwxZlA0pP`

  all_devices: any = [];
  all_devices_cords: any = [];
  device_list: any = [];
  device_loc: any = { device_id: '', device_name: '', device_imei: '', lat: '', lng: '' }
  selectedDeviceId: string = '';

  @ViewChild('map')
  private mapContainer!: ElementRef<HTMLElement>;

  constructor(private api: DevicesService) { }

  ngOnInit(): void {
    this.getAllDevices();
  }

  async ngAfterViewInit() {
    const initialState = { zoom: 1 };

    // Check for geolocation and set the map center
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.center.lat = position.coords.latitude;
        this.center.lng = position.coords.longitude;

        // Initialize the map
        this.map = new Map({
          container: this.mapContainer.nativeElement,
          style: this.style,
          center: [this.center.lng, this.center.lat],
          zoom: initialState.zoom
        });

        // After map loads, add the device markers
        this.map.on('load', () => {
          this.initializeMap();

          // Add zoom button event listeners
          document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.map!.zoomIn();
          });

          document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.map!.zoomOut();
          });
        });

      });
    } else {
      console.log("User did not allow geolocation");
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  getAllDevices() {
    this.api.all_devices().subscribe((data: any) => {
      this.all_devices = data;

      // Ensure device_list is cleared before populating
      this.device_list = [];

      // List of all devices
      if (this.all_devices.success?.length > 0) {

        // Loop through each device to get their positions
        this.all_devices.success.forEach((device: any) => {
          // Set default device object (lat & lng will be filled later if available)
          const device_loc: any = {
            device_id: device.id,
            device_name: device.name || 'N/A',  // Ensure name is not blank
            device_imei: device.imei || 'N/A',  // Ensure IMEI is not blank
            lat: null,
            lng: null
          };

          // Fetch device position
          this.api.all_device_position(device.id).subscribe((positionData: any) => {
            // Extract the date keys and sort by id in descending order
            const dateKeys = Object.keys(positionData.data || {});
            const sortedData = dateKeys
              .map(date => positionData.data[date])
              .flat()  // Flatten the array since each key holds an array of data
              .sort((a: any, b: any) => b.id - a.id); // Sort by id in descending order

            // If sortedData is not empty, extract the highest id data point
            if (sortedData.length > 0) {
              const highestIdData = sortedData[0];
              // Update lat and lng with the position data
              device_loc.lat = highestIdData.end_lat;
              device_loc.lng = highestIdData.end_lng;
            }

            // Push device location (whether lat/lng exists or not) to device_list
            this.device_list.push(device_loc);

          },
            (error: any) => {
              // In case of an error fetching position data, push the device without lat/lng
              this.device_list.push(device_loc);
            });
        });
      }
    });
  }

  initializeMap() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: this.style,
      center: [this.center.lng, this.center.lat],
      zoom: 3
    });

    this.map.on('load', () => {
      // Add a GeoJSON source for routes
      this.map!.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add a layer to visualize the route
      this.map!.addLayer({
        id: 'route-layer',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#FF0000',
          'line-width': 4
        }
      });

      // Add the initial marker with the custom icon
      new Marker({
        element: this.createCustomMarkerElement()
      })
        .setLngLat([this.center.lng, this.center.lat])
        .addTo(this.map!);

      // Add markers to the map
      this.device_list.forEach((device: any) => {
        if (device.lat && device.lng) {
          const marker = new Marker({ color: 'red', anchor: 'bottom' })
            .setLngLat([device.lng, device.lat])
            .addTo(this.map!);

          /* marker.getElement().addEventListener('click', () => {
            console.log(device.device_id);
            this.handleMarkerClick(device.device_id);
          }); */

          // Optional: Create and display popups
          const popup = new Popup({ offset: 5 })
            .setText(`Device: ${device.device_name}`)
            .setLngLat([device.lng, device.lat])
            .addTo(this.map!);

          marker.getElement().addEventListener('click', () => {
            this.handleMarkerClick(device.device_id);
            // Remove existing popups if needed
            const existingPopup = this.map!.getLayer('popup');
            if (existingPopup) {
              this.map!.removeLayer('popup');
            }

            // Create a new popup
            new Popup({ offset: 5 })
              .setText(`Device: ${device.device_name}`)
              .setLngLat([device.lng, device.lat])
              .addTo(this.map!);
          });
        }
      });
    });
  }

  // Helper method to create a custom marker element
  createCustomMarkerElement(): HTMLElement {
    const markerElement = document.createElement('div');
    markerElement.style.backgroundImage = 'url(assets/marker-red.png)';
    markerElement.style.backgroundImage = `url('assets/marker.png')`;
    markerElement.style.width = '32px';
    markerElement.style.height = '24px';
    markerElement.style.backgroundSize = 'contain';
    markerElement.style.backgroundRepeat = 'no-repeat';
    markerElement.style.cursor = 'pointer';
    return markerElement;
  }

  navigate(lat: number, lng: number) {
    if (this.map) {
      this.map.flyTo({
        center: [lng, lat], // Fly to the provided lat-lng
        zoom: 12, // Zoom level to 18
        essential: true // Ensures the animation works
      });
    }
  }

  handleMarkerClick(deviceId: string) {
    // Fetch and display route data when marker is clicked
    this.fetchAndDisplayRoute(deviceId);
  }

  fetchAndDisplayRoute(deviceId: string) {
    this.api.get_route(deviceId).subscribe((data: any) => {
      if (this.map) {
        const source = this.map.getSource('route') as GeoJSONSource | undefined;
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: this.extractFeatures(data),
          });
        } else {
          console.error('GeoJSONSource "route" not found.');
        }
      }
    });
  }

  extractFeatures(data: any): Feature<LineString | Point, GeoJsonProperties>[] {
    const features: Feature<LineString | Point, GeoJsonProperties>[] = [];
    // Extract and sort the routes
    const routes = Object.values(data.data).flat();
    routes.sort((a: any, b: any) => b.id.localeCompare(a.id)); // Sort by id in descending order

    if (routes.length > 0) {
      let route: any = routes[0]; // Take the first route after sorting
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [parseFloat(route.start_lng), parseFloat(route.start_lat)],
            [parseFloat(route.end_lng), parseFloat(route.end_lat)],
          ],
        },
        properties: {
          description: `Distance: ${route.distance} meters`,
        },
      });

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(route.start_lng), parseFloat(route.start_lat)],
        },
        properties: {
          description: 'Start',
          icon: 'start',
        },
      });

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(route.end_lng), parseFloat(route.end_lat)],
        },
        properties: {
          description: 'End',
          icon: 'end',
        },
      });
    }

    return features;
  }
}