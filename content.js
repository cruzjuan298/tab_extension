const divContainer = document.getElementById("div-container");
const addButton = document.getElementById("add-session-button");
const editButton = document.getElementById("edit-session-button");

let editModeState = false;
let windowCount = 0;
let visibilityState = "hidden";
let displayState = "none";

getStoredWindows().forEach((session, index) => {
    const sessionElement = createHtmlList(session.urlsData, session.sessionId, index + 1);
    divContainer.insertBefore(sessionElement, null);
    })


//getting stored windows in order to edit or delete 
function getStoredWindows(){
    return JSON.parse(localStorage.getItem("window-session")) || [];
}

function getSingleStoredWindow(sessionId){
    return getStoredWindows().find(session => session.sessionId === sessionId);
}

//storing the session in local storage with the value corresponding with the object that gets passed
function storeWindows(sessionData){
    let storedData = getStoredWindows();
    storedData.push(sessionData);
    localStorage.setItem("window-session", JSON.stringify(storedData));
}

//checking if there are no saved browser sessions; displays generic text
function checkPlaceHolder(){
    const ulElements = divContainer.getElementsByClassName("ul-list");
    const placeHolderElement = document.getElementById("placeholder");
    if (ulElements.length === 0 && !placeHolderElement){
        const placeHolderElement = document.createElement('p');
        placeHolderElement.id = "placeholder";
        placeHolderElement.textContent = "Any saved windows will show up here...";
        divContainer.appendChild(placeHolderElement);
    } else if (ulElements.length > 0 && placeHolderElement){
        placeHolderElement.remove();
    }
}

//Add session on click
addButton.addEventListener("click", async () => {
    await addTabsList();
    if (editModeState){
        updateVisibilty("visible", "delete-button");
        updateVisibilty("visible", "add-tab-button");
    }
});

//Edit session with click
editButton.addEventListener("click", async () => {
    editModeState = !editModeState;
    visibilityState = editModeState ? "visible" : "hidden";
    displayState = editModeState ? "block" : "none"
    updateVisibilty(visibilityState, displayState, "delete-button");
    updateVisibilty(visibilityState, displayState, "add-tab-button");
    updateVisibilty(visibilityState,displayState, "trash-image")
})

//Event Delegation used to target the delete button that is being clicked
divContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-button")) {
        const deleteButton = event.target;
        const sessionWindow = parseInt(deleteButton.closest(".ul-list").dataset.sessionId);
        console.log(sessionWindow);
        deleteWindow(sessionWindow);
    }
    if (event.target.classList.contains("add-tab-button")){
        const addButton = event.target;
        const sessionWindow = parseInt(addButton.closest(".ul-list").dataset.sessionId);
        console.log(sessionWindow);
        addCurrTab(sessionWindow);
    }
    if (event.target.classList.contains("trash-image")) {
        const trash = event.target;
        const sessionWindow = parseInt(trash.closest(".ul-list").dataset.sessionId);
        const urlLi = trash.closest(".li-list");
        const url = trash.closest(".li-list").querySelector(".tab-name").href;
        console.log(sessionWindow);
        console.log(url);
        deleteTab(sessionWindow, url, urlLi);
    }
    if (event.target.classList.contains("ul-list")) {
        const windowText = event.target;
        const sessionsWindow = parseInt(windowText.closest(".ul-list").dataset.sessionId);
        const urls = findUrls(sessionsWindow);
        createNewWindow(urls)
    }
})

//Fetch Urls from the currect session
async function getUrls(){
    return new Promise((resolve) => {
        chrome.tabs.query({currentWindow: true}, (tabs) => {
            const tabsList = tabs.map(tab => tab.url);
            resolve(tabsList);
        });
    });
}

function createTrashElement(visibility, display){
    let imgElement = document.createElement("img");
    imgElement.classList.add("trash-image")
    imgElement.setAttribute('src', "trash.png")
    imgElement.style.visibility = visibility;
    imgElement.style.display = display;

    return imgElement;
}

function createTabElement(url){
    let aElement= document.createElement('a');
    aElement.setAttribute('href', url);
    aElement.setAttribute('target', '_blank');
    aElement.textContent = new URL(url).hostname;
    aElement.classList.add("tab-name")
    return aElement;
}

function createLiElement(){
    let liElement = document.createElement('li');
    liElement.classList.add("li-list");

    return liElement;
}
//Create the Html for the session
function createHtmlList(urls, id, index){
    const ulElement = document.createElement("ul");
    ulElement.classList.add("ul-list");
    ulElement.textContent = `Browser Session ${index}`;
    ulElement.dataset.sessionId = id;

    const divButton = document.createElement("div");
    divButton.classList.add("div-buttons")

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.style.visibility = visibilityState;
    deleteButton.style.display = displayState;
    deleteButton.textContent = `Delete Session ${index}`;
    //console.log(windowNum)

    const addTabButton = document.createElement("button");
    addTabButton.classList.add("add-tab-button");
    addTabButton.textContent = `Add Tab`;
    addTabButton.style.visibility = visibilityState; 
    addTabButton.style.display = displayState;

    divButton.appendChild(addTabButton);
    divButton.appendChild(deleteButton);
    ulElement.appendChild(divButton);

    urls.forEach(url => {
        let liElement = createLiElement();

        let imageElement = createTrashElement(visibilityState, displayState);

        let aElement = createTabElement(url);

        liElement.appendChild(aElement);
        liElement.appendChild(imageElement);
        ulElement.appendChild(liElement);
        
    })

    return ulElement
}
//add new lists to the container
async function addTabsList(){
    const urls = await getUrls();

    const sessionData = {
        urlsData: urls,
        sessionId: Math.floor(Math.random() * 1000000)
    }
    
    storeWindows(sessionData);
    
    const index = getStoredWindows().length
    const tabshHtml =  createHtmlList(urls, sessionData.sessionId, index);
    divContainer.appendChild(tabshHtml);
    checkPlaceHolder();
}

//deleting a session by looking for the specific window
function deleteWindow(sessionId){
    const ulElements = Array.from(divContainer.getElementsByClassName("ul-list"));
    const elementToRemove = ulElements.find(ul => parseInt(ul.dataset.sessionId) === sessionId);

    if(elementToRemove){
        elementToRemove.remove();
        deleteFromLocalStorage(sessionId)
        updateWindows();
    }
}

//updates window so that when a one is added or deleted, the proper data is saved
function updateWindows(){
    const ulElements = Array.from(divContainer.getElementsByClassName("ul-list"));

    ulElements.forEach((ul, index) => {
        const newSessionNumber = index + 1;
        ul.dataset.sessionNumber = newSessionNumber;
        ul.childNodes[0].textContent = `Browser Session ${newSessionNumber}`;
        const deleteButton = ul.querySelector(".delete-button");
        deleteButton.textContent = `Delete Session ${newSessionNumber}`;
    })
    checkPlaceHolder();
}

//updates visibility of the delete buttons
function updateVisibilty(visibility, display, className){
    const buttons = document.getElementsByClassName(className);
    for (let i = 0; i < buttons.length; i++){
    buttons[i].style.visibility = visibility;
    buttons[i].style.display = display;
    }
}

function deleteFromLocalStorage(sessionId){
    let storedData = getStoredWindows();

    storedData = storedData.filter(session => session.sessionId != sessionId)
    localStorage.setItem("window-session", JSON.stringify(storedData))

}

async function getCurrTab(){
    let queryOptions = {active: true, currentWindow: true}

    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab.url)
    return tab.url;
}

async function addCurrTab(sessionId){
    currentTab = await getCurrTab();
    let storedData = getSingleStoredWindow(sessionId);
    storedData.urlsData.push(currentTab);
    
    let totalStoredData = getStoredWindows();

    let replaceIndex = totalStoredData.findIndex(session => session.sessionId === sessionId)

    if (replaceIndex !== - 1){
        totalStoredData[replaceIndex] = storedData
    } else console.log("Session not found in totalStoredData")


    console.log(storedData)
    console.log(replaceIndex)
    console.log(getStoredWindows())

    localStorage.setItem("window-session", JSON.stringify(totalStoredData))

    const ulElement = divContainer.querySelector(`[data-session-id="${sessionId}"]`);
    let liElement = createLiElement();

    let aElement = createTabElement(currentTab);
    let imgElement = createTrashElement(visibilityState, displayState);

    liElement.appendChild(aElement);
    liElement.appendChild(imgElement);
    ulElement.appendChild(liElement);
    
}

function deleteTabFromSession(sessions ,sessionId, removedUrl){
    let session = sessions.find(session => session.sessionId === sessionId);

    if (session) {
        session.urlsData = session.urlsData.filter(url => url !== removedUrl);
    }
}

function deleteTabHtml(li) {
    li.remove();
}

function deleteTab(sessionId, url, urlHtml) {
    const sessions = getStoredWindows();
    deleteTabFromSession(sessions, sessionId, url)
    console.log(sessions)

    localStorage.setItem("window-session", JSON.stringify(sessions))
    deleteTabHtml(urlHtml);
}

function findUrls(sessionsId) {
    const sessions = getStoredWindows();
    const targetSession = sessions.find(session => session.sessionId === sessionsId)

    return targetSession.urlsData
}

//opens a new window with all of the tabs saved in the session;
function createNewWindow(urls){

    chrome.windows.create({
        focused: true,
        url : urls,
        type: "normal",
        state: "maximized"
    }
    )
}

checkPlaceHolder()
