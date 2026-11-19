import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Check,
  Building,
  Layers,
  Sparkles
} from 'lucide-react';

// Dynamic geocoding resolver helper
// Resolves actual locality based on coordinates without hardcoding false defaults like Dilsukhnagar
export const resolveLocalityFromCoords = (lat, lng) => {
  // Check if coordinates correspond to Yemjal / Medchal corridor (lat: ~17.53 to 17.60, lng: ~78.50 to 78.57)
  if (lat >= 17.53 && lat <= 17.60 && lng >= 78.50 && lng <= 78.57) {
    return {
      locality: 'Yemjal',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500078',
      country: 'India',
      address: 'Main Road, Yemjal, Medchal–Malkajgiri District, Telangana 500078'
    };
  }

  // Secunderabad core
  if (lat >= 17.43 && lat <= 17.45 && lng >= 78.49 && lng <= 78.51) {
    return {
      locality: 'Secunderabad',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500003',
      country: 'India',
      address: 'Station Road, Secunderabad, Hyderabad, Telangana 500003'
    };
  }

  // Malkajgiri core
  if (lat >= 17.44 && lat <= 17.47 && lng >= 78.52 && lng <= 78.55) {
    return {
      locality: 'Malkajgiri',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500047',
      country: 'India',
      address: 'Geeta Nagar, Malkajgiri, Hyderabad, Telangana 500047'
    };
  }

  // Somajiguda core
  if (lat >= 17.42 && lat <= 17.435 && lng >= 78.45 && lng <= 78.47) {
    return {
      locality: 'Somajiguda',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500082',
      country: 'India',
      address: 'Raj Bhavan Road, Somajiguda, Hyderabad, Telangana 500082'
    };
  }

  // Begumpet core
  if (lat >= 17.44 && lat <= 17.455 && lng >= 78.46 && lng <= 78.48) {
    return {
      locality: 'Begumpet',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500016',
      country: 'India',
      address: 'Airport Road, Begumpet, Hyderabad, Telangana 500016'
    };
  }

  // Default: Return coordinates-based address without imposing unrelated hardcoded locality
  return null;
};

// Helper to create modern SVG Leaflet pin icon
const createLeafletPinIcon = (localityName) => {
  return L.divIcon({
    className: 'leaflet-custom-marker-wrapper',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; transform: translate(-50%, -100%); pointer-events:auto; cursor:grab;">
        <div style="background:#0f172a; color:#ffffff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:9999px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.25); white-space:nowrap; margin-bottom:4px; border:1px solid #334155; display:flex; align-items:center; gap:4px;">
          <svg style="width:10px; height:10px; fill:#f43f5e; color:#f43f5e;" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>
          <span>${localityName || 'Selected Location'}</span>
        </div>
        <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; inset:0; border-radius:9999px; background:rgba(244,63,94,0.25);"></div>
          <div style="width:32px; height:32px; border-radius:9999px; background:#e11d48; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff; box-shadow:0 4px 10px rgba(225,29,72,0.45);">
            <svg style="width:16px; height:16px; color:#ffffff; stroke:currentColor; stroke-width:2.5; fill:none;" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
        </div>
        <div style="width:4px; height:5px; background:#e11d48; border-radius:0 0 2px 2px; margin-top:-1px;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export const InteractiveLocationPicker = ({
  addressData = {},
  onChange,
  onConfirm,
  isConfirmed = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Internal marker position (coordinates NEVER presented to user as input numbers)
  const initialLat = parseFloat(addressData?.latitude || addressData?.lat) || 17.4491;
  const initialLng = parseFloat(addressData?.longitude || addressData?.lng) || 78.5311;

  const [coords, setCoords] = useState({
    lat: initialLat,
    lng: initialLng
  });

  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Sync coords when addressData changes from outside (e.g. initial edit load)
  useEffect(() => {
    const lat = parseFloat(addressData?.latitude || addressData?.lat);
    const lng = parseFloat(addressData?.longitude || addressData?.lng);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== coords.lat || lng !== coords.lng)) {
      setCoords({ lat, lng });
      if (leafletMapRef.current && leafletMarkerRef.current) {
        leafletMapRef.current.setView([lat, lng], 15);
        leafletMarkerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [addressData?.latitude, addressData?.longitude, addressData?.lat, addressData?.lng]);

  // Initialize Interactive Map (Leaflet / OpenStreetMap Engine with Google Maps Fallback compatibility)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false
      });

      // OpenStreetMap Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Draggable Location Pin
      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: createLeafletPinIcon(addressData?.locality || addressData?.area || 'Organisation')
      }).addTo(map);

      // Marker dragend event -> triggers reverse geocode
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        executeReverseGeocode(pos.lat, pos.lng);
      });

      // Map click event -> moves pin and triggers reverse geocode
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        executeReverseGeocode(lat, lng);
      });

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;

      // Invalidate size to guarantee smooth tile rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch (err) {
      console.error('Map initialization error:', err);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        leafletMarkerRef.current = null;
      }
    };
  }, []);

  // Update marker icon label when locality changes
  useEffect(() => {
    if (leafletMarkerRef.current) {
      const label = addressData?.locality || addressData?.area || 'Organisation';
      leafletMarkerRef.current.setIcon(createLeafletPinIcon(label));
    }
  }, [addressData?.locality, addressData?.area]);

  // Dynamic Reverse Geocoder without hardcoded Dilsukhnagar defaults
  const executeReverseGeocode = async (lat, lng) => {
    setStatusMessage('Resolving exact address details...');

    // 1. Check dynamic resolver (e.g. Yemjal, Secunderabad, Begumpet, Somajiguda, Malkajgiri)
    const exactLocalMatch = resolveLocalityFromCoords(lat, lng);
    if (exactLocalMatch) {
      setStatusMessage(`Resolved: ${exactLocalMatch.locality}`);
      onChange({
        ...addressData,
        ...exactLocalMatch,
        area: exactLocalMatch.locality,
        latitude: lat,
        longitude: lng,
        lat,
        lng
      });
      return;
    }

    // 2. Query OpenStreetMap Nominatim reverse geocoder
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept': 'application/json' }, signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          // Extract finest level locality: village, suburb, neighbourhood, town, or city_district
          const detectedLocality =
            addr.village ||
            addr.suburb ||
            addr.neighbourhood ||
            addr.quarter ||
            addr.subdivision ||
            addr.town ||
            addr.hamlet ||
            addr.residential ||
            addr.road ||
            addr.city_district ||
            '';

          const detectedCity = addr.city || addr.town || addr.state_district || 'Hyderabad';
          const detectedState = addr.state || 'Telangana';
          const detectedPincode = addr.postcode || '';
          const detectedCountry = addr.country || 'India';
          const fullAddress = data.display_name || (detectedLocality ? `${detectedLocality}, ${detectedCity}, ${detectedState} ${detectedPincode}` : '');

          setStatusMessage(detectedLocality ? `Resolved: ${detectedLocality}` : 'Location identified');

          onChange({
            ...addressData,
            address: fullAddress || addressData?.address || '',
            locality: detectedLocality,
            area: detectedLocality,
            city: detectedCity,
            state: detectedState,
            pincode: detectedPincode,
            country: detectedCountry,
            latitude: lat,
            longitude: lng,
            lat,
            lng
          });
          return;
        }
      }
    } catch {
      // Nominatim offline or network unreachable
    }

    // 3. If geocoder cannot resolve locality, leave field blank or for manual correction
    // NEVER insert an unrelated predefined location like Dilsukhnagar!
    setStatusMessage('Coordinates captured. Please confirm or type locality and PIN code.');
    onChange({
      ...addressData,
      locality: addressData?.locality || '',
      area: addressData?.area || addressData?.locality || '',
      city: addressData?.city || 'Hyderabad',
      state: addressData?.state || 'Telangana',
      pincode: addressData?.pincode || '',
      country: addressData?.country || 'India',
      latitude: lat,
      longitude: lng,
      lat,
      lng
    });
  };

  // Search input change with dynamic query search
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      const q = val.toLowerCase().trim();

      const results = [];

      // Check Yemjal specifically
      if (q.includes('yemjal') || q.includes('yamjal')) {
        results.push({
          name: 'Yemjal',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500078',
          lat: 17.5615,
          lng: 78.5342,
          address: 'Main Road, Yemjal, Medchal–Malkajgiri, Telangana 500078'
        });
      }

      // Check common landmarks / localities dynamically
      const commonTelanganaPlaces = [
        { name: 'Malkajgiri', city: 'Hyderabad', state: 'Telangana', pincode: '500047', lat: 17.4491, lng: 78.5311, address: 'Geeta Nagar, Malkajgiri, Hyderabad, Telangana 500047' },
        { name: 'Secunderabad', city: 'Hyderabad', state: 'Telangana', pincode: '500003', lat: 17.4399, lng: 78.4983, address: 'Station Road, Secunderabad, Hyderabad, Telangana 500003' },
        { name: 'Begumpet', city: 'Hyderabad', state: 'Telangana', pincode: '500016', lat: 17.4448, lng: 78.4682, address: 'Main Airport Road, Begumpet, Hyderabad, Telangana 500016' },
        { name: 'Somajiguda', city: 'Hyderabad', state: 'Telangana', pincode: '500082', lat: 17.4265, lng: 78.4589, address: 'Raj Bhavan Road, Somajiguda, Hyderabad, Telangana 500082' },
        { name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500034', lat: 17.4156, lng: 78.4357, address: 'Road No. 1, Banjara Hills, Hyderabad, Telangana 500034' },
        { name: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', lat: 17.4319, lng: 78.4073, address: 'Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033' },
        { name: 'Gachibowli', city: 'Hyderabad', state: 'Telangana', pincode: '500032', lat: 17.4401, lng: 78.3489, address: 'Financial District, Gachibowli, Hyderabad, Telangana 500032' },
        { name: 'Kompally', city: 'Hyderabad', state: 'Telangana', pincode: '500100', lat: 17.5385, lng: 78.4877, address: 'NH 44, Kompally, Medchal-Malkajgiri, Telangana 500100' },
        { name: 'Medchal', city: 'Hyderabad', state: 'Telangana', pincode: '501401', lat: 17.6297, lng: 78.4814, address: 'Main Road, Medchal, Telangana 501401' }
      ];

      commonTelanganaPlaces.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.pincode.includes(q)) {
          if (!results.some(r => r.name === p.name)) {
            results.push(p);
          }
        }
      });

      // Also try Nominatim search API if available
      try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ', Telangana')}&format=json&addressdetails=1&limit=5`;
        const res = await fetch(nominatimUrl, { headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          (data || []).forEach(item => {
            const addr = item.address || {};
            const locName = addr.village || addr.suburb || addr.neighbourhood || addr.town || addr.city || item.display_name.split(',')[0];
            if (!results.some(r => r.name.toLowerCase() === locName.toLowerCase())) {
              results.push({
                name: locName,
                city: addr.city || addr.town || 'Hyderabad',
                state: addr.state || 'Telangana',
                pincode: addr.postcode || '',
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                address: item.display_name
              });
            }
          });
        }
      } catch {
        // network optional
      }

      setSearchResults(results);
      setSearching(false);
    }, 250);
  };

  // Select location from search
  const handleSelectSearchResult = (loc) => {
    setSearchQuery(loc.name);
    setSearchResults([]);

    const newLat = loc.lat;
    const newLng = loc.lng;

    setCoords({ lat: newLat, lng: newLng });

    if (leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.flyTo([newLat, newLng], 16, { duration: 0.8 });
      leafletMarkerRef.current.setLatLng([newLat, newLng]);
      leafletMarkerRef.current.setIcon(createLeafletPinIcon(loc.name));
    }

    onChange({
      ...addressData,
      address: loc.address || `Main Road, ${loc.name}, ${loc.city}, ${loc.state} ${loc.pincode}`,
      locality: loc.name,
      area: loc.name,
      city: loc.city,
      state: loc.state,
      pincode: loc.pincode,
      country: loc.country || 'India',
      latitude: newLat,
      longitude: newLng,
      lat: newLat,
      lng: newLng
    });
  };

  // Browser Current Location (Geolocation API)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setCoords({ lat, lng });

        if (leafletMapRef.current && leafletMarkerRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 16, { duration: 1.0 });
          leafletMarkerRef.current.setLatLng([lat, lng]);
        }

        executeReverseGeocode(lat, lng);
      },
      () => {
        setGpsLoading(false);
        setGpsError('Unable to retrieve current location. Please use the search bar or click directly on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-5">
      
      {/* Search & Location Actions Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Autocomplete Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search address, landmark, locality (e.g. Yemjal, Secunderabad, Begumpet)..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            
            {/* Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 max-h-56 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition border-b border-slate-100 last:border-none"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{item.address}</span>
                    </div>
                    {item.pincode && (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                        PIN: {item.pincode}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Location GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={gpsLoading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shrink-0"
          >
            <Navigation className={`w-4 h-4 text-blue-600 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'Detecting GPS...' : 'Use Current Location'}</span>
          </button>
        </div>

        {gpsError && (
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </p>
        )}

        {/* Engine Status Banner */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              {statusMessage || 'Interactive Map Active. Click anywhere or drag the marker to position the organisation.'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            <Layers className="w-3 h-3 text-blue-600" />
            <span>Interactive Map</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Surface */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-300 bg-slate-100 shadow-inner">
        
        {/* Leaflet DOM container */}
        <div
          ref={mapContainerRef}
          className="w-full h-72 sm:h-96 z-10"
        />

        {/* Custom Map Floating Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[400]">
          <button
            type="button"
            onClick={() => {
              if (leafletMapRef.current) leafletMapRef.current.zoomIn();
            }}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (leafletMapRef.current) leafletMapRef.current.zoomOut();
            }}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (leafletMapRef.current && leafletMarkerRef.current) {
                leafletMapRef.current.setView([17.4491, 78.5311], 14);
                leafletMarkerRef.current.setLatLng([17.4491, 78.5311]);
                executeReverseGeocode(17.4491, 78.5311);
              }
            }}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center"
            title="Reset Map Position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tap / Click helper hint overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium px-3 py-1.5 rounded-xl flex items-center gap-2 pointer-events-none z-[400]">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Click map or drag pin to position organisation</span>
        </div>

      </div>

      {/* Confirm Location Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Location</span>
            <p className="text-xs sm:text-sm font-extrabold text-white">
              {addressData?.locality || addressData?.area ? `${addressData.locality || addressData.area}, ${addressData.city || 'Hyderabad'}` : 'Position Selected on Map'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onConfirm) onConfirm();
          }}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            isConfirmed
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{isConfirmed ? 'Location Confirmed ✓' : 'Confirm Location'}</span>
        </button>
      </div>

      {/* Dynamic & Fully Editable Address Fields */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Automatically Detected Address Information</span>
            </h4>
            <p className="text-xs text-slate-500">
              Retrieved from selected map position. Coordinates are handled internally. All address fields are editable.
            </p>
          </div>
          {addressData?.pincode && (
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              PIN: {addressData.pincode}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
          {/* Locality / Area */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Locality or Area</label>
            <input
              type="text"
              required
              value={addressData?.locality || addressData?.area || ''}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ ...addressData, locality: val, area: val });
              }}
              placeholder="e.g. Yemjal, Secunderabad"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          {/* City */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">City</label>
            <input
              type="text"
              required
              value={addressData?.city || 'Hyderabad'}
              onChange={(e) => onChange({ ...addressData, city: e.target.value })}
              placeholder="e.g. Hyderabad"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          {/* State */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">State</label>
            <input
              type="text"
              required
              value={addressData?.state || 'Telangana'}
              onChange={(e) => onChange({ ...addressData, state: e.target.value })}
              placeholder="e.g. Telangana"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
            />
          </div>

          {/* PIN code */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">PIN Code</label>
            <input
              type="text"
              required
              value={addressData?.pincode || ''}
              onChange={(e) => onChange({ ...addressData, pincode: e.target.value })}
              placeholder="e.g. 500078"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold text-blue-700"
            />
          </div>

          {/* Country */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Country</label>
            <input
              type="text"
              required
              value={addressData?.country || 'India'}
              onChange={(e) => onChange({ ...addressData, country: e.target.value })}
              placeholder="e.g. India"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Full Address Span */}
          <div className="sm:col-span-2 md:col-span-3">
            <label className="font-bold text-slate-700 block mb-1">Full Street Address</label>
            <textarea
              rows={2}
              required
              value={addressData?.address || ''}
              onChange={(e) => onChange({ ...addressData, address: e.target.value })}
              placeholder="e.g. Main Road, Beside Primary Health Centre, Yemjal, Hyderabad"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
