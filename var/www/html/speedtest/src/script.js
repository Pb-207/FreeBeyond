const imagesize = 5241768 //in bytes
const src = "https://upload.wikimedia.org/wikipedia/commons/5/55/2012-03-21_21-34-00-startrails.jpg"
const current_speed_element = document.querySelector('#current_speed')
const downloading_speed_array = [];
const uploading_speed_array = []
const arrow = document.querySelector('#trapezoid')
const all_range = document.querySelectorAll('#all_number > div')
const circle_range = document.querySelector('#circle_range')
const button = document.querySelector('button')

let basic_info, previous_time, global_time;

function update_elements() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  document.querySelector('#connection_type').textContent = connection.effectiveType;
  const downloadspeed = connection.downlink;
  document.querySelector('#network_status').textContent = (downloadspeed >= 10 ? "good (speed > 10)" : `poor (speed ${downloadspeed} < 10)`)
  document.querySelector('#rtt').textContent = connection.rtt
  document.querySelector('#info > #isp').textContent = basic_info.connection.organization
  document.querySelector('#info > #ip').textContent = basic_info.ip + ` (${basic_info.type})`
  document.querySelector('#info > #city').textContent = basic_info.location.city + ", " + basic_info.location.region.name
  document.querySelector('#info > #country').textContent = basic_info.location.postal + ", " + basic_info.location.country.name
  document.querySelector('#time').textContent = global_time.toString().slice(4, 24)
  document.querySelector('#broswer').textContent = basic_info.user_agent.name
  document.querySelector('#os').textContent = basic_info.user_agent.os.name;
  document.querySelector('#device').textContent = basic_info.user_agent.os.type

  button.addEventListener('click', function() {
    document.querySelector('#parent_circle').style.display = 'revert'
    arrow.style.display = 'revert';
    document.querySelector('#parent_of_button').style.display = "none"
    current_speed_element.textContent = "Connecting"
    current_speed_element.style.color = 'grey'
    current_speed_element.style.fontSize = "1em"


    setTimeout(() => {
      get_download_speed()
      current_speed_element.style.fontSize = "2em"
      current_speed_element.style.color = 'white'
      current_speed_element.textContent = ""
    }, 2000)


  })

}


function fecth_basic_info() {
  return fetch('https://api.ipregistry.co/?key=5pset9ruii4bjgp9')
    .then(res => res.json())
    .then(data => {
      return data
    })
}

function get_download_speed() {
  document.querySelector("#download_or_upload").textContent = 'Download'
  const blob = new Blob([
    document.querySelector('#web_worker_one').textContent
  ], {
    type: "text/javascript"
  })

  const worker = new Worker(window.URL.createObjectURL(blob));
  worker.onmessage = function(e) {

    //e.data/1000 =>convert from milliseconds to minutes
    //imagesize * 8 => convert imagesize from byte to bits 
    // '/1024' => convert to kbs
    // '/1024' => convert to mbs
    const current_speed = (imagesize * 8 / (e.data / 1000) / 1024 / 1024).toFixed(2)
    console.log(current_speed)
    current_speed_element.textContent = current_speed
    downloading_speed_array.push(current_speed)
    const percentage = calculate_percentage(current_speed)
    circle_range.style.setProperty('--percentage', percentage)
    if (downloading_speed_array.length < 40) {
      previous_time && previous_time - performance.now() < 500 ? setTimeout(get_download_speed, 500) : (get_download_speed())
    } else {
      get_average(downloading_speed_array, false);
      get_upload_speed()

    }

  }
  worker.postMessage(`${src}?${new Date().getTime()}`);
}

function get_average(arr, isupload) {
  const array = arr.slice()
  for (let i = 0; i < 2; i++) {
    array.splice(array.indexOf(Math.max.apply(null, array)), 1)
    array.splice(array.indexOf(Math.min.apply(null, array)), 1)
  }
  array.splice(array.indexOf(Math.max.apply(null, array)), 1)
  const sum = array.reduce((sum, cur) => parseFloat(sum) + parseFloat(cur));
  document.querySelector(`#${isupload ? "upload_speed" : "download_speed"}`).textContent = (sum / array.length).toFixed(2)


}


//it is very hard to determine how to give the percentage for circle_range since the circle doesn't distributed equally          function calculate_percentage(speed) {
//the circle_range reach 1 mb when circle range has a percentage of 9
function calculate_percentage(speed) {
  let passed_number = null;
  if (speed <= 1) {
    passed_number = 0;
    change_text_color(passed_number)
    //1 is at transform: rotate(-89deg);
    arrow.style.transform = `rotate(${- 123 + (speed - passed_number) / (1 - passed_number) * 34}deg) `

    return (speed - passed_number) / (1 - passed_number) * 9;
  } else if (speed < 5) {
    passed_number = 1;
    change_text_color(passed_number)
    //5 is at transform: rotate(-59deg);
    arrow.style.transform = `rotate(${- 89 + (speed - passed_number) / (5 - passed_number) * 30}deg) `

    return (speed - passed_number) / (5 - passed_number) * 9 + 9;
  } else if (speed < 10) {
    passed_number = 5;
    change_text_color(passed_number)
    // 10 is at transform: rotate(-27deg);
    arrow.style.transform = `rotate(${- 57 + (speed - passed_number) / (10 - passed_number) * 32}deg) `

    return (speed - passed_number) / (10 - passed_number) * 10 + 18;

  } else if (speed < 20) {
    passed_number = 10
    change_text_color(passed_number)
    // 20 is at transform: rotate(27deg);
    arrow.style.transform = `rotate(${-27 + (speed - passed_number) / (20 - passed_number) * 54}deg) `

    return (speed - passed_number) / (20 - passed_number) * 15.5 + 27;

  } else if (speed < 30) {
    passed_number = 20
    change_text_color(passed_number)
    //30 is at transform: rotate(57deg);
    arrow.style.transform = `rotate(${27 + (speed - passed_number) / (30 - passed_number) * 30}deg) `


    return (speed - passed_number) / (30 - passed_number) * 10 + 42.5;

  } else if (speed < 50) {
    passed_number = 30;
    change_text_color(passed_number)
    //50 is at transform: rotate(89deg);
    arrow.style.transform = `rotate(${57+ (speed - passed_number) / (50 - passed_number) * 32}deg) `

    return (speed - passed_number) / (50 - passed_number) * 8.5 + 52.5;
  } else if (speed < 100) {
    passed_number = 50;
    change_text_color(passed_number)
    //50 is at transform: rotate(125deg);
    arrow.style.transform = `rotate(${89 + (speed - passed_number) / (100 - passed_number) * 36}deg) `


    return (speed - passed_number) / (100 - passed_number) * 9 + 61;
  } else {
    passed_number = 100
    change_text_color(passed_number)
    arrow.style.transform = "rotate(130deg)"
    //the full circle is 70
    return 70;
  }
}

function change_text_color(max_passed_number) {
  all_range.forEach(i => i.classList.remove('shining'))
  all_range.forEach(i => {
    if (i.textContent <= max_passed_number) i.classList.add('shining')
  })
}

window.onload = function() {
  Promise.all([fecth_basic_info(), fetch_time()]).then(result => {
    basic_info = result[0]
    global_time = result[1]
    update_elements();

    arrow.style.transition = 'transform 0.1s ease-out'
    all_range.forEach((i, index) => {
      i.style.animation = `0.125s ease-in ${index / 8}s 1 appearing`
      i.addEventListener('animationend', () => i.style.opacity = 1)
    })


  })

}

function fetch_time() {

  return fetch("https://worldtimeapi.org/api/timezone/america/new_york")
    .then(res => res.json())
    .then(data => new Date(data.datetime))

}

function get_upload_speed() {
  document.querySelector("#download_or_upload").textContent = 'Upload'

  circle_range.style.setProperty('--color', "#895bdd")
  const blob = new Blob([
    document.querySelector('#web_worker_two').textContent
  ], {
    type: "text/javascript"
  })

  const worker = new Worker(window.URL.createObjectURL(blob));
  worker.onmessage = function(e) {

    const speed = e.data.toFixed(2)
    uploading_speed_array.push(speed);
    const percentage = calculate_percentage(speed)
    current_speed_element.textContent = speed;

    circle_range.style.setProperty('--percentage', percentage)
    if (uploading_speed_array.length < 40) {
      previous_time && previous_time - performance.now() < 500 ? setTimeout(get_upload_speed, 500) : (get_upload_speed())
    } else {
      get_average(uploading_speed_array, true)
      final_page()
    }
    previous_time = performance.now()

  }
  worker.postMessage("start");
}

function final_page() {
  document.querySelector("#parent_circle").style.display = 'none'
  document.querySelector('#meta_data').style.display = 'none'
  document.querySelector('#info').style.display = 'none'
  document.querySelector("#download_or_upload").style.display = 'none'
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  createChart()
  arrow.style.display = 'none'
  document.querySelector('#time').style.display = 'none'
  const restart_button = document.createElement('button')
  restart_button.style.cssText = `
    background:linear-gradient(#23cdfa, #70ffbd);
    color:white;
    width:100px;
    height:100px;
    border-radius:50%;
    font-weight:900;
    position:absolute;
    font-size:1.3em;
    top:75vh;
    left:82.5vw;
    `
  restart_button.textContent = 'Restart'
  document.body.appendChild(restart_button)
  restart_button.addEventListener('click', () => {
    window.location.reload()
  })




}


function createChart() {
  const context = document.querySelector('canvas').getContext('2d')
  var myChart = new Chart(context, {
    type: 'line',
    data: {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false
      },
      interaction: {
        intersect: false
      },
      plugins: {
        tooltip: {
          enabled: false
        },
        legend: false
      },
      labels: uploading_speed_array.map((i, index) => index + 1),
      datasets: [

        {
          label: 'upload',
          data: uploading_speed_array,
          fill: false,
          radius: 0,
          pointHoverRadius: 0,
          borderColor: '#9860e6'
        },
        {
          label: 'download',
          data: downloading_speed_array,
          fill: false,
          borderColor: '#37dbf8',
          radius: 0,
          pointHoverRadius: 0

        }

      ]
    },
    options: {
      scales: {
        y: {

          grid: {
            display: false,
          },
          ticks: {
            beginAtZero: true,
            color: "white",
            font: {
              size: 18
            }
          },

        },
        x: {
          ticks: {
            beginAtZero: true,
            color: "white",
            font: {
              size: 18
            }
          },
          grid: {
            display: false,
          },
          type: 'linear',
        }

      }
    }

  });
}