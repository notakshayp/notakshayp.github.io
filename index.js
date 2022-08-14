 
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



  if(document.getElementById('projects-list-div')){
    renderProjects(false);
  }
  else if(document.getElementById('projects-featured-list-div')){
    renderProjects(true)
  }