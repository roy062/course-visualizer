function setCourseNodePositions()
{
    // Repeatedly take a course from the list of courses and add the course and its related
    // courses to the matrix
    var courseMatrix = [];
    var courseList = [];
    for (var i = 0, len = courses.length; i < len; i++)
	courseList.push(courses[i]);
    while (courseList.length > 0)
    {
	var proposedMatrix = [[]];
	var courseStack = [];
	var originLevel = 0;
	courseStack.push([courseList.shift(), 0]);
	while (courseStack.length > 0)
	{
	    var courseToAdd = courseStack.pop();
	    var relativeLevel = courseToAdd[1];
	    courseToAdd = courseToAdd[0];
	    // Add row to proposedMatrix as needed
	    if (originLevel + relativeLevel < 0)
	    {
		proposedMatrix.unshift([]);
		originLevel++;
	    }
	    while (originLevel + relativeLevel >= proposedMatrix.length)
		proposedMatrix.push([]);

	    proposedMatrix[originLevel + relativeLevel].push(courseToAdd);
	    courseToAdd.prereqs.forEach(function (element, index, array) {
		var index = courseList.indexOf(idToCourse(element));
		if (index == -1)
		    return;
		var course = courseList[index];
		removeFrom(courseList, course);
		courseStack.push([course, relativeLevel - 1]);
	    });
	    courseToAdd.coreqs.forEach(function (element, index, array) {
		var index = courseList.indexOf(idToCourse(element));
		if (index == -1)
		    return;
		var course = courseList[index];
		removeFrom(courseList, course);
		courseStack.push([course, relativeLevel]);
	    });
	    courseToAdd.subreqs.forEach(function (element, index, array) {
		var index = courseList.indexOf(idToCourse(element));
		if (index == -1)
		    return;
		var course = courseList[index];
		removeFrom(courseList, course);
		courseStack.push([course, relativeLevel + 1]);
	    });
	}
	
	// Compress proposedMatrix to fit within the number of columns
	var nCols = getNumCols();
	for (var i = 0; i < proposedMatrix.length; i++)
	    if (proposedMatrix[i].length > nCols)
		proposedMatrix.splice(i+1, 0, proposedMatrix[i].splice(nCols, proposedMatrix[i].length - nCols));
	
	// Find a place to insert the proposed matrix
	var topLevel = 0;
	for ( ; topLevel < courseMatrix.length; topLevel++)
	{
	    for (var i = 0; topLevel + i < courseMatrix.length && i < proposedMatrix.length; i++)
		if (courseMatrix[topLevel + i].length + proposedMatrix[i].length > nCols)
		    break;
	    if (!(topLevel + i < courseMatrix.length && i < proposedMatrix.length))
		break;
	}

	for (var i = 0, len = proposedMatrix.length; i < len; i++)
	{
	    if (!courseMatrix[topLevel + i])
		courseMatrix[topLevel + i] = proposedMatrix[i];
	    else
		proposedMatrix[i].forEach(function (element, index, array) {
		    courseMatrix[topLevel + i].push(element);
		});
	}
    }

    for (var i = 0, len = courseMatrix.length; i < len; i++)
    {
	for (var j = 0, len2 = courseMatrix[i].length; j < len2; j++)
	{
	    var top = 3 + 8 * i;
	    var left = positionInEm((4 + 24 * j) + "%", false);
	    if (!courseMatrix[i][j].initialized)
	    {
		courseMatrix[i][j].element.style.left = (positionInEm("20%", false) * -1) + "em";
		courseMatrix[i][j].element.style.top = top + "em";
		courseMatrix[i][j].initialized = true;
	    }
	    moveElementTo(courseMatrix[i][j].element, top, left, 300);
	}
    }

    // Draw lines for all pre-reqs and co-reqs
    var background = document.getElementById("background");
    background.width = parseFloat(getComputedStyle(background, null).width);
    background.height = parseFloat(getComputedStyle(background, null).height);
    var drawingContext = background.getContext("2d");

    var solidLines = [];
    var dottedLines = [];
    if (!courses[0])
	return;
    var elementHeight = positionInEm(getComputedStyle(courses[0].element, null).height, true);
    var elementWidth = positionInEm(getComputedStyle(courses[0].element, null).width, false);
    var elementVertPadding = positionInEm(getComputedStyle(courses[0].element, null).padding, true);
    var elementHoriPadding = positionInEm(getComputedStyle(courses[0].element, null).padding, false);

    for (var i = 0, cLen = courses.length; i < cLen; i++)
    {
	for (var j = 0, pLen = courses[i].prereqs.length; j < pLen; j++)
	{
	    var prereqCourse = idToCourse(courses[i].prereqs[j]);
	    if (prereqCourse)
	    {
		var srcTop = prereqCourse.element.topDest || prereqCourse.element.style.top;
		srcTop = parseFloat(srcTop);
		srcTop = emToPx(srcTop + elementHeight + 2 * elementVertPadding);
		var srcLeft = prereqCourse.element.leftDest || prereqCourse.element.style.left;
		srcLeft = parseFloat(srcLeft);
		srcLeft = emToPx(srcLeft + elementWidth / 2 + elementHoriPadding);
		var destTop = courses[i].element.topDest || courses[i].element.style.top;
		destTop = parseFloat(destTop);
		destTop = emToPx(destTop);
		var destLeft = courses[i].element.leftDest || courses[i].element.style.left;
		destLeft = parseFloat(destLeft);
		destLeft = emToPx(destLeft + elementWidth / 2 + elementHoriPadding);
		
		solidLines.push([srcLeft, srcTop, destLeft, destTop]);
	    }
	}
	for (var j = 0, coLen = courses[i].coreqs.length; j < coLen; j++)
	{
	    var coreqCourse = idToCourse(courses[i].coreqs[j]);
	    if (coreqCourse)
	    {
		var srcTop = coreqCourse.element.topDest || coreqCourse.element.style.top;
		srcTop = parseFloat(srcTop);
		var srcLeft = coreqCourse.element.leftDest || coreqCourse.element.style.left;
		srcLeft = parseFloat(srcLeft);
		var destTop = courses[i].element.topDest || courses[i].element.style.top;
		destTop = parseFloat(destTop);
		var destLeft = courses[i].element.leftDest || courses[i].element.style.left;
		destLeft = parseFloat(destLeft);
		
		srcTop = emToPx(srcTop + elementHeight / 2 + elementVertPadding);
		destTop = emToPx(destTop + elementHeight / 2 + elementVertPadding);
		if (Math.abs(srcLeft - destLeft) < 0.1)
		{
		    var horiDist = positionInEm("2%", false);
		    dottedLines.push([emToPx(srcLeft - horiDist), srcTop,
				      emToPx(srcLeft), srcTop]);
		    dottedLines.push([emToPx(destLeft - horiDist), destTop,
				      emToPx(destLeft), destTop]);
		    srcLeft = srcLeft - horiDist;
		    destLeft = destLeft - horiDist;
		}
		else if (srcLeft < destLeft)
		{
		    srcLeft = srcLeft + elementWidth + 2 * elementHoriPadding;
		}
		else if (destLeft < srcLeft)
		{
		    destLeft = destLeft + elementWidth + 2 * elementHoriPadding;
		}

		srcLeft = emToPx(srcLeft);
		destLeft = emToPx(destLeft);
		
		dottedLines.push([srcLeft, srcTop, destLeft, destTop]);
	    }
	}
    }

    var frame = 0;
    var animation = setInterval(function () {
	frame++;
	drawingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
	drawingContext.strokeStyle = "rgba(0,0,0," + (0.5 * frame / 40) + ")";

	drawingContext.setLineDash([]);
	for (var i = 0, len = solidLines.length; i < len; i++)
	{
	    var srcLeft = solidLines[i][0];
	    var srcTop = solidLines[i][1];
	    var destLeft = solidLines[i][2];
	    var destTop = solidLines[i][3];
	    
	    drawingContext.beginPath();
	    
	    drawingContext.moveTo(srcLeft, srcTop);
	    drawingContext.lineTo(destLeft, destTop);
	    drawingContext.closePath();
	    drawingContext.stroke();
	}

	drawingContext.setLineDash([5, 10]);
	for (var i = 0, len = dottedLines.length; i < len; i++)
	{
	    var srcLeft = dottedLines[i][0];
	    var srcTop = dottedLines[i][1];
	    var destLeft = dottedLines[i][2];
	    var destTop = dottedLines[i][3];

	    drawingContext.beginPath();
	    
	    drawingContext.moveTo(srcLeft, srcTop);
	    drawingContext.lineTo(destLeft, destTop);
	    drawingContext.closePath();
	    drawingContext.stroke();
	}

	if (frame == 40)
	    clearInterval(animation);
    }, 10);
}

function getNumCols()
{
    return 4; // TODO: actually compute the number of columns needed
}

function pxToEm(px)
{
    var fontSize = window.getComputedStyle(document.getElementById("body"), null).fontSize;
    var pxPerEm = parseFloat(fontSize);
    return px / pxPerEm;
}

function emToPx(em)
{
    var fontSize = window.getComputedStyle(document.getElementById("body"), null).fontSize;
    var pxPerEm = parseFloat(fontSize);
    return em * pxPerEm;
}
