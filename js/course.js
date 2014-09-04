courses = [];

function Course(id, name, prereqs, coreqs, subreqs)
{
    this.id = id;
    this.name = name;
    this.prereqs = prereqs || [];
    this.coreqs = coreqs || [];
    this.subreqs = subreqs || [];
    this.initialized = false;

    this.element = document.createElement("div");
    this.element.className = "course_node";
    this.element.innerHTML = "<b>" + this.id + "</b>" + "<br>" + this.name;
    var self = this;
    this.element.onclick = function() {
	select(self);
    };

    document.getElementById("visualizer").appendChild(this.element);
}

Course.prototype.reinitializeElement = function ()
{
    this.element.innerHTML = "<b>" + this.id + "</b>" + "<br>" + this.name;
}

function insertCourse(course)
{
    courses.push(course);
}

function loadAllCourses()
{
    var numCourses = localStorage.getItem("numCourses");
    if (!numCourses || parseInt(numCourses) < 1)
	return;
    numCourses = parseInt(numCourses);

    for (var i = 0; i < numCourses; i++)
	insertCourse(new Course(localStorage.getItem("id" + i),
				localStorage.getItem("name" + i),
				stringToArray(localStorage.getItem("prereqs" + i)),
				stringToArray(localStorage.getItem("coreqs" + i)),
			        stringToArray(localStorage.getItem("subreqs" + i))));
}

function saveAllCourses()
{
    for (var i = 0, len = courses.length; i < len; i++)
    {
	localStorage.setItem("id" + i, courses[i].id);
	localStorage.setItem("name" + i, courses[i].name);
	localStorage.setItem("prereqs" + i, arrayToString(courses[i].prereqs));
	localStorage.setItem("coreqs" + i, arrayToString(courses[i].coreqs));
	localStorage.setItem("subreqs" + i, arrayToString(courses[i].subreqs));
    }
}

function idToCourse(id)
{
    for (var i = 0, len = courses.length; i < len; i++)
	if (courses[i].id == id)
	    return courses[i];
    return null;
}

function removeCourse(id)
{
    var i = 0;
    for (var len = courses.length; i < len; i++)
	if (courses[i].id == id)
	    break;
    
    if (i == courses.length)
	return;

    courses[i].element.parentNode.removeChild(courses[i].element);
    if (i != courses.length - 1)
	courses[i] = courses.pop();
    else
	courses.pop();
}

function removeAllCourses()
{
    for (var i = 0, len = courses.length; i < len; i++)
	courses[i].element.parentNode.removeChild(courses[i].element);
    courses = [];
}

function iterator()
{
    var iterator = new Object();
    iterator.index = 0;

    iterator.next = function () {
	if (this.index == courses.length)
	    return null;
	var course = courses[this.index];
	this.index++;
	return course;
    }

    return iterator;
}
