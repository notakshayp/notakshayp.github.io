 
  const renderProjects=(isFeatrued)=>{
  fetch('./data/projects.json')
    .then(response => response.json())
    .then(data =>{
      for(let itr=0;itr<data.length;itr++){
        let addHTMLVal=`
        <div class="project">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title gradientText" style="font-weight:bold;">${data[itr]['project_name']}</h5>
              <h6 class="card-subtitle mb-2 text-muted ">
              ${data[itr]['tech_stack']}
              </h6>
              <p class="card-text">
              ${data[itr]['desc']}  
              </p>`

              if(data[itr]['demo_url'].length!=0){
                addHTMLVal+=` <a href="${data[itr]['demo_url']}" target="_blank" class="card-link" style="font-weight: bold; font-size: x-large;">Demo</a> `
              }if(data[itr]['code_repo'].length!=0){
                addHTMLVal+=` <a href="${data[itr]['code_repo']}" target="_blank" class="card-link" style="font-weight: bold; font-size: x-large;">Code</a> `
              }
              if(data[itr]['blog_url'].length!=0){
                addHTMLVal+=` <a href="${data[itr]['blog_url']}" target="_blank" class="card-link" style="font-weight: bold; font-size: x-large;">Blog</a> `
              }
           addHTMLVal+=`</div>
          </div>
        </div>`;

        if(isFeatrued && data[itr]['featured']){
          document.getElementById('projects-featured-list-div').innerHTML+=addHTMLVal;
        }
        else if(!isFeatrued){
          document.getElementById('projects-list-div').innerHTML+=addHTMLVal;
        
        }


      }
    })
    .catch(error => console.log(error));
  }



const toggleTheme=()=>{
  let icon_nav_bar="";
  let style_text="";

  if(theme==="light"){
    theme="dark";
    icon_nav_bar="fa-sun-o";
    
    document.getElementById("theme-icon").classList.remove('fa-moon-o');
    document.getElementById("theme-icon").classList.add('fa-sun-o');

    style_text="scroll-behavior: smooth;    -webkit-filter: invert(100%);    -moz-filter: invert(100%);    -o-filter: invert(100%);    -ms-filter: invert(100%);";
    

  }
  else{
    theme="light";
    icon_nav_bar="fa-moon-o";
    
    document.getElementById("theme-icon").classList.remove('fa-sun-o');
    document.getElementById("theme-icon").classList.add('fa-moon-o');

    style_text="scroll-behavior: smooth;";

  }

  var myDiv = document.getElementsByTagName("html")[0];
  myDiv.setAttribute("style", style_text);
  document.cookie = `theme=${theme};`;
}

function getCookie (name) {
	let value = `; ${document.cookie}`;
	let parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}






  let theme=getCookie('theme');
  if(theme===undefined){
    theme="light";
  }

  if(theme=="dark"){
    //setting theme on load
    theme="light";
    toggleTheme()
  }



  if(document.getElementById('projects-list-div')){
    renderProjects(false);
  }
  else if(document.getElementById('projects-featured-list-div')){
    renderProjects(true)
  }

document.getElementById('theme').addEventListener("click",toggleTheme)