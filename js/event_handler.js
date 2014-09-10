function addCourse()
{
    var newId = document.getElementById("add_id").value.trim();
    if (idToCourse(newId))
	return; // TODO: add error message
    insertCourse(new Course(newId, document.getElementById("add_name").value.trim()));
    setCourseNodePositions();
}

function changeCourse()
{
    var newId = document.getElementById("change_id").value.trim();
    if (idToCourse(newId) != selectedCourse)
	return; // TODO: add error message
    
    // Find removed and added prereqs and update subreqs accordingly
    var changedPrereqs = getChanges(selectedCourse.prereqs, stringToArray(document.getElementById("change_prereqs").value));
    for (var i = 0, len = changedPrereqs.added.length; i < len; i++)
    {
	var course = idToCourse(changedPrereqs.added[i]);
	if (course)
	    course.subreqs.push(newId);
    }
    for (var i = 0, len = changedPrereqs.deleted.length; i < len; i++)
    {
	var course = idToCourse(changedPrereqs.deleted[i]);
	if (course)
	    removeFrom(course.subreqs, newId);
    }

    selectedCourse.id = newId;
    selectedCourse.name = document.getElementById("change_name").value.trim();
    selectedCourse.prereqs = stringToArray(document.getElementById("change_prereqs").value);
    selectedCourse.coreqs = stringToArray(document.getElementById("change_coreqs").value);

    selectedCourse.reinitializeElement();
    
    setCourseNodePositions();
}

function changePopup(popup)
{
    if (activePopup == popup)
	return;
    hidePopup(true);

    showPopup(popup);
}

function showPopup(popup)
{
    moveElementTo(popup, 0, 0, 200);
    if (popup == document.getElementById("add_course"))
	moveElementTo(document.getElementById("add_course_button"), 10, 0, 200);
    activePopup = popup;
}

function hidePopup(hideAddCourseButton)
{
    if (hideAddCourseButton)
	moveElementTo(document.getElementById("add_course_button"), -2, 0, 200);
    else
	moveElementTo(document.getElementById("add_course_button"), 0, 0, 200);

    if (!activePopup)
	return;

    moveElementTo(activePopup, -10, 0, 200);

    activePopup = null;
}

function hideChangeCourse()
{
    deselect();
    selectedCourse = null;

    if (activePopup == document.getElementById("change_course"))
    {
	moveElementTo(activePopup, -10, 0, 200);
	moveElementTo(document.getElementById("add_course_button"), 0, 0, 200);
	activePopup = null;
    }
}

function deselect(course)
{
    course = course || selectedCourse;
    if (!course)
	return;

    selectedCourse.element.style.backgroundColor = "rgba(0,0,0,0.1)";
}

function select(course)
{
    if (selectedCourse)
	deselect();

    course.element.style.backgroundColor = "#aaaaff";
    selectedCourse = course;

    document.getElementById("change_id").value = selectedCourse.id;
    document.getElementById("change_name").value = selectedCourse.name;
    document.getElementById("change_prereqs").value = arrayToString(selectedCourse.prereqs);
    document.getElementById("change_coreqs").value = arrayToString(selectedCourse.coreqs);

    changePopup(document.getElementById("change_course"));
}

function stringToArray(string)
{
    if (!string)
	return [];
    var tokens = string.split(",");
    for (var i = 0, len = tokens.length; i < len; i++)
	tokens[i] = tokens[i].trim();
    return tokens;
}

function arrayToString(array)
{
    var string = "";
    for (var i = 0, len = array.length; i < len; i++)
	string += array[i] + ", ";
    return string.substr(0, string.length - 2);
}

function dropdownAddCourse()
{
    changePopup(document.getElementById("add_course"));
}

function moveElementTo(element, topDest, leftDest, time)
{
    var topSrc = positionInEm(element.style.top, true);
    var leftSrc = positionInEm(element.style.left, false);
    var frame = 0;
    var nFrames = Math.ceil(time / 10);
    var yVel = 2 * (topDest - topSrc) / nFrames;
    var yAccel = -yVel / (nFrames - 1);
    var xVel = 2 * (leftDest - leftSrc) / nFrames;
    var xAccel = -xVel / (nFrames - 1);
    var elementSrc = element;
    element.topDest = topDest + "em";
    element.leftDest = leftDest + "em";

    var animation = setInterval(function () {
	frame++;
	topSrc += yVel;
	leftSrc += xVel;
	elementSrc.style.top = topSrc + "em";
	elementSrc.style.left = leftSrc + "em";
	yVel += yAccel;
	xVel += xAccel;
	if (frame == nFrames)
	{
	    elementSrc.style.top = topDest + "em";
	    elementSrc.style.left = leftDest + "em";
	    clearInterval(animation);
	}
    }, 10);
}

function positionInEm(string, isVertical)
{
    // Find index to split
    var i = 0;
    for (var len = string.length; i < len; i++)
	if (!isNumeric(string.charAt(i)))
	    break;
    var value = parseFloat(string.substr(0, i));
    var unit = string.substr(i, string.length - i).trim();
    switch (unit)
    {
    case "em":
	return value;
    case "px":
	return pxToEm(value);
    case "%":
	if (isVertical)
	    return pxToEm(window.innerHeight) * value / 100;
	return pxToEm(window.innerWidth) * value / 100;
    default:
	return value;
    }
}

function isNumeric(character)
{
    if (!isNaN(parseInt(character)))
	return true;
    if (character == "-" || character == ".")
	return true;
    return false;
}

function deleteCourse()
{
    removeCourse(selectedCourse.id);
    selectedCourse = null;
    hidePopup(false);
}

function loadCourses()
{
    loadAllCourses();
    
    setCourseNodePositions();
}

function saveCourses()
{
    localStorage.clear();
    localStorage.setItem("version", "0.1");
    localStorage.setItem("numCourses", "" + courses.length);

    saveAllCourses();
}

function promptClearCourses()
{
    document.getElementById("overlay").style.display = "inline";
    document.getElementById("clear_prompt").style.display = "inline";
    var frames = 0;
    var nFrames = 20;
    var animation = setInterval(function () {
	frames++;
	document.getElementById("overlay").style.opacity = frames * 0.02;
	document.getElementById("clear_prompt").style.opacity = frames * 0.05;
	if (frames == nFrames)
	    clearInterval(animation);
    }, 10);
}

function clearCourses()
{
    removeAllCourses();
    var canvas = document.getElementById("background");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    hidePrompt();
}

function hidePrompt()
{
    document.getElementById("overlay").style.display = "none";
    document.getElementById("clear_prompt").style.display = "none";
}

function onResize()
{
    var background = document.getElementById("background");
    background.width = parseFloat(getComputedStyle(background, null).width);
    background.height = parseFloat(getComputedStyle(background, null).height);
    setCourseNodePositions();
}

function getChanges(old, current)
{
    var oldCopy = [];
    for (var i = 0, len = old.length; i < len; i++)
	oldCopy[i] = old[i];
    var currentCopy = [];
    for (var i = 0, len = current.length; i < len; i++)
	currentCopy[i] = current[i];

    var changes = new Object();
    changes.added = [];
    changes.deleted = [];
    var i = 0, j = 0;
    while (i < oldCopy.length && j < currentCopy.length)
    {
	if (oldCopy[i] > currentCopy[j])
	{
	    changes.added.push(currentCopy[j]);
	    j++;
	}
	else if (oldCopy[i] < currentCopy[j])
	{
	    changes.deleted.push(oldCopy[i]);
	    i++;
	}
	else // (oldCopy[i] == currentCopy[j])
	{
	    i++;
	    j++;
	}
    }
    for (var len = oldCopy.length; i < len; i++)
	changes.deleted.push(oldCopy[i]);
    for (var len = currentCopy.length; j < len; j++)
	changes.added.push(currentCopy[j]);
    return changes;
}

function removeFrom(array, element)
{
    for (var i = 0, len = array.length; i < len; i++)
	if (array[i] == element)
	    break;
    if (i == array.length)
	return;
    for (var j = i, len = array.length; j < len - 1; j++)
	array[j] = array[j+1];
    array.pop();
}
