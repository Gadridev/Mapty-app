'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const form_r = document.querySelector('.form__row');
//parentClass
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  months = [];
  click=0
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; //Km
    this.duration = duration; //min
  }
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on
 ${months[this.date.getMonth()]} 
 ${this.date.getDate()}`;
  }
  Clicks(){
    this.click++
  }
}
//childs classes
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.calcpace();
    this._setDescription();
  }
  calcpace() {
    // min/km
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcspeed();
    this._setDescription();
  }
  calcspeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
const run = new Running([29, -12], 10, 20, 30);
const cyc = new Cycling([29, -12], 2.3, 20, 30);
console.log(run, cyc);

class App {
  #mapEvent;
  #map;
  #workouts = [];
  #mapZoom=13

  constructor() {
    this._getPosition();
    //getData from local storage
    this._getLocalStorage()
     //atach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._ToogleEvelation);
    containerWorkouts.addEventListener('click',this._moveTopopup.bind(this))
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('you should be access your position');
        }
      );
  }
  _moveTopopup(e){
    const workoutEl=e.target.closest('.workout')
    console.log(workoutEl)
    if(!workoutEl) return;
    const workout=this.#workouts.find((work)=>work.id===workoutEl.dataset.id)
    this.#map.setView(workout.coords,this.#mapZoom,{
        animate:true,
        pan:{
            duration:1
        }
    })
    console.log(workout)
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);
    //   console.log(map)
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach((item)=>{
    this._WorkoutMarker(item)
    });
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    console.log(mapEvent);
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _ToogleEvelation() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    console.log(form_r);
  }
  _newWorkout(e) {
    const validinput = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    const negativeInput = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();
    //get Data from form
    const { lat, lng } = this.#mapEvent.latlng;
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workout;
    // If acticity running ,create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      if (
        !validinput(distance, duration, cadence) ||
        !negativeInput(distance, duration, cadence)
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
      )
        return alert('input have to be a positif number');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // If activity cycling,create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validinput(distance, duration, elevation) ||
        !negativeInput(distance, duration)
      )
        return alert('input have to be a positif number');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);
    console.log(workout);
    // render workout on map as marker
    this._renderWorkout(workout);
    //hide form +clear input fields
    this._hideForm()
    //Set localStorage to ll workouts
    this._SetlocalStorage();
    //Display Marker
    this._WorkoutMarker(workout);
    inputDistance.value =
      inputCadence.value =
      inputElevation.value =
      inputDuration.value =
        '';
  }
  _hideForm(){
    inputDistance.value =
      inputCadence.value =
      inputElevation.value =
      inputDuration.value =
        '';
    form.style.display='none'
    form.classList.add('hidden');
    setTimeout(()=>form.style.display='grid',1000)

    

  }
  _renderWorkout(work) {
    let html = `
    <li class="workout workout--${work.type}" data-id="${work.id}">
          <h2 class="workout__title">${work.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              work.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${work.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${work.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          </div>
       
    `;
    if (work.type === 'running') 
      html += ` 
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${work.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${work.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
        `;
    
    if (work.type === 'cycling') 
        html += ` 
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${work.speed.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${work.elevationGain}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
          `;
            form.insertAdjacentHTML('afterend', html);
  }
  _WorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }${workout.description}`)
      .openPopup();
  }
  _SetlocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.#workouts))
  }
  _getLocalStorage(){
   const data=JSON.parse(localStorage.getItem('workouts'))
   console.log(data)
   if(!data) return;
   this.#workouts=data;
   this.#workouts.forEach((work)=>{
    this._renderWorkout(work)
   })
  }
  
  
}
const app = new App();
let mapEvent;
let map;
