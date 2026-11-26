import { getToken, removeToken } from './token.js';
import * as projects from './projects.js';

const token = getToken();
if (!token) {
  window.location.replace('login.html'); 
}

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    removeToken();
    window.location.replace('login.html');
  });
}

const crearBtn = document.getElementById('create-project');
crearBtn.addEventListener('submit', async (event) => {
    event.preventDefault();

    const projName = document.getElementById('name').value;
    const projDescription = document.getElementById('description').value;
    const projTechnologies = document.getElementById('technologies').value
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);
    const projRepository = document.getElementById('repository').value;
    const projImage = document.getElementById('image').value;

    if (
        projName.trim() === "" || 
        projDescription.trim() === "" || 
        projTechnologies.length === 0 || 
        projRepository.trim() === "" || 
        projImage.trim() === ""
    ) {
        alert("Ningun valor puede estar vacio.");
        return;
    }

    try {
        await projects.createProject({
            title: projName, 
            description: projDescription, 
            technologies: projTechnologies, 
            repository: projRepository, 
            images: [projImage]
        });

        await refresh();
    } catch (error) {
        console.error('error:', error);
        alert(`Error: ${error?.message || error}`);
    } 
});

async function clickProyecto(projectId, tipo) {
    if (tipo == "mod") {
        await actualizarProyecto(projectId);
    } else if (tipo == "elim") {
        await projects.deleteProject(projectId);
        await refresh();
    }
}

async function actualizarProyecto(projectId) {
    const divOriginal = document.getElementById(projectId);
    if (!divOriginal) return;
    
    if (divOriginal.classList.contains("mod")) {
        const nameEl = divOriginal.querySelector('[name="name"]');
        const descEl = divOriginal.querySelector('[name="description"]');
        const techEl = divOriginal.querySelector('[name="technologies"]');
        const repoEl = divOriginal.querySelector('[name="repository"]');
        const imgEl = divOriginal.querySelector('[name="image"]');

        const projName = nameEl.value.trim();
        const projDescription = descEl.value.trim();
        const projTechnologies = techEl.value
            .split('\n')
            .map((t) => t.trim())
            .filter(Boolean);
        const projRepository = repoEl.value.trim();
        const projImage = imgEl.value.trim();

        if (
            projName === "" ||
            projDescription === "" ||
            projTechnologies.length === 0 ||
            projRepository === "" ||
            projImage === ""
        ) {
            alert("Ningun valor puede estar vacio.");
            return;
        }

        try {
            await projects.updateProject(projectId, {
                title: projName,
                description: projDescription,
                technologies: projTechnologies,
                repository: projRepository,
                images: [projImage],
            });

            await refresh();
        } catch (error) {
            console.error('error:', error);
            alert(`Error: ${error?.message || error}`);
        }
        return;
    }
    
    const ogName = divOriginal.querySelector('h3');
    const ogDesc = divOriginal.querySelector('.description');
    const ogTecs = divOriginal.querySelectorAll('li');
    const ogRepo = divOriginal.querySelector('a');
    const ogImg = divOriginal.querySelector('img');

    const divCopia = document.createElement("div");
    divCopia.classList.add("project");
    divCopia.classList.add("mod");
    
    const formNuevo = document.createElement("form");
    formNuevo.style.padding = "0";
    formNuevo.style.border = "none";
    formNuevo.style.boxShadow = "none";
    
    const lblName = document.createElement("label");
    lblName.textContent = "Nombre:";
    formNuevo.appendChild(lblName);
    
    const inputName = document.createElement("input");
    inputName.name = "name";
    inputName.type = "text";
    inputName.required = true;
    inputName.value = ogName.textContent;
    formNuevo.appendChild(inputName);
    
    const backImage = document.createElement("img");
    backImage.src = ogImg.src;
    backImage.alt = ogImg.alt;
    formNuevo.appendChild(backImage);

    const lblImage = document.createElement("label");
    lblImage.textContent = "Imagen (URL):";
    formNuevo.appendChild(lblImage);
    
    const inputImg = document.createElement("input");
    inputImg.name = "image";
    inputImg.type = "text";
    inputImg.required = true;
    inputImg.value = ogImg.src;
    formNuevo.appendChild(inputImg);

    const lblDesc = document.createElement("label");
    lblDesc.textContent = "Descripcion:";
    formNuevo.appendChild(lblDesc);

    const inputDesc = document.createElement("input");
    inputDesc.name = "description";
    inputDesc.type = "text";
    inputDesc.required = true;
    inputDesc.value = ogDesc.textContent;
    formNuevo.appendChild(inputDesc);
    
    let ogTec = "";
    ogTecs.forEach((li) => {
        ogTec += li.textContent + "\n";
    });

    const lblTec = document.createElement("label");
    lblTec.textContent = "Tecnologias:";
    formNuevo.appendChild(lblTec);
    
    const txtTec = document.createElement("textarea");
    txtTec.name = "technologies";
    txtTec.required = true;
    txtTec.value = ogTec;
    formNuevo.appendChild(txtTec);
    
    const lblRepo = document.createElement("label");
    lblRepo.textContent = "Repositorio:";
    formNuevo.appendChild(lblRepo);
    
    const inputRepo = document.createElement("input");
    inputRepo.name = "repository";
    inputRepo.type = "text";
    inputRepo.required = true;
    inputRepo.value = ogRepo ? ogRepo.href : "";
    formNuevo.appendChild(inputRepo);
    
    const divBotones = document.createElement("div");
    divBotones.classList.add("botones");

    const btnMod = document.createElement("button");
    btnMod.textContent = "Guardar";
    btnMod.classList.add("btn-modificar");
    btnMod.type = "button";
    divBotones.appendChild(btnMod);
    btnMod.addEventListener("click", () => { clickProyecto(projectId, "mod"); });

    const btnCanc = document.createElement("button");
    btnCanc.textContent = "Cancelar";
    btnCanc.classList.add("btn-eliminar");
    btnCanc.type = "button";
    btnCanc.addEventListener("click", () => { refresh(); });
    divBotones.appendChild(btnCanc);

    formNuevo.appendChild(divBotones);
    
    divCopia.appendChild(formNuevo);
    divCopia.id = projectId;
    divOriginal.replaceWith(divCopia);
}

const divProjects = document.getElementById('my-projects');

async function refresh() {
    document.getElementById('name').value = "";
    document.getElementById('description').value = "";
    document.getElementById('technologies').value = "";
    document.getElementById('repository').value = "";
    document.getElementById('image').value = "";
    
    const request = await projects.getProjectsByUser();
    const projectList = Array.isArray(request) ? request : request?.projects;

    if (projectList) {
        divProjects.innerHTML = '';

        projectList.forEach(project => {
            const divProject = document.createElement("div");
            divProject.classList.add("project");
            divProject.id = project._id;
            
            let techItems = "";

            if (project.technologies && project.technologies.length != 0) {
                techItems = `<p class="etiqueta-rosa"><strong>Tecnologias:</strong></p>\n<div class="projects-section"><ul>`;
                techItems += project.technologies
                    .map(tech => `<li>${tech}</li>`)
                    .join('');
                techItems += "</ul></div>";
            }

            const imgUrl = (project.images && project.images.length > 0) ? project.images : 'Fondo4.jpg';

            divProject.innerHTML = `
                <h3>${project.title}</h3>
                <img src="${imgUrl}" alt="${project.title}" loading="lazy">
                <p class="description">${project.description || ''}</p>
                
                ${techItems}

                <div class="repository">
                    Puedes encontrar el repositorio en <a href="${project.repository}" target="_blank" style="color: #faa0cd;">${project.repository}</a>
                </div>
            `;
            
            const divBotones = document.createElement("div");
            divBotones.classList.add("botones");

            const btnMod = document.createElement("button");
            btnMod.textContent = "Modificar";
            btnMod.classList.add("btn-modificar");
            divBotones.appendChild(btnMod);
            btnMod.addEventListener("click", () => { clickProyecto(divProject.id, "mod"); });

            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.classList.add("btn-eliminar");
            divBotones.appendChild(btnEliminar);
            btnEliminar.addEventListener("click", () => { clickProyecto(divProject.id, "elim"); });

            divProject.appendChild(divBotones);
            divProjects.appendChild(divProject);
        });
    }   
}

refresh();

