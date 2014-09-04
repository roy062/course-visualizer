selectedCourse = null;
activePopup = null;

window.requestAnimationFrame(function() {
    document.getElementById("add_course").style.top = "-10em";
    document.getElementById("change_course").style.top = "-10em";
    document.getElementById("add_course_button").style.top = "0em";
    var background = document.getElementById("background");
    background.width = parseFloat(getComputedStyle(background, null).width);
    background.height = parseFloat(getComputedStyle(background, null).height);
    background.getContext("2d").lineWidth = 3;
    window.addEventListener("resize", onResize);
    loadCourses();
});


