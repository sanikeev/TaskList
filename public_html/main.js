function addTask(form) {

    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];

    var $activeTaskList = document.getElementById('activeTaskList');
    var taskElementIndex = itemsList.length;
    if (taskElementIndex === 0) {
        taskElementIndex = 1;
    } else {
        taskElementIndex = parseInt(itemsList[itemsList.length - 1].id) + 1;
    }
    var newItem = _addListElement(taskElementIndex, form.name.value);

    $activeTaskList.appendChild(newItem);

    var item = {
        id: taskElementIndex,
        name: form.name.value,
        del: false
    };
    itemsList.push(item);
    localStorage.setItem('taskList', JSON.stringify(itemsList));

    form.name.value = null;
}
function showTaskList() {
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    if (itemsList.length < 0) {
        return false;
    }
    _refreshTaskList(itemsList);
}

function endTask(el) {
    var li = el.parentNode.parentNode;
    var id = el.parentNode.parentNode.id.replace("task-id-", "");
    var name = el.parentNode.querySelector('span').innerText;
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    var $activeTaskList = document.getElementById('activeTaskList');
    var $closedTaskList = document.getElementById('closedTaskList');
    itemsList.forEach(function (item, i, arr) {
        if (item.id == id) {
            arr[i] = {id: id, name: name, del: true};
            var element = _addListElement(item.id, item.name, true);
            $closedTaskList.appendChild(element);
        }
    });
    localStorage.setItem('taskList', JSON.stringify(itemsList));
    $activeTaskList.removeChild(li);
}

function showDelTaskButton() {
    var btn = this.lastChild.querySelector("button");
    if (!btn) {
        return false;
    }
    btn.style.display = "inherit";
}

function removeDelTaskButton() {
    var btn = this.lastChild.querySelector("button");
    btn.style.display = "none";
}

function delTask(el) {
    var li = el.parentNode.parentNode.parentNode;
    var list = li.parentNode;
    var id = li.id.replace("task-id-", "");
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    for (var i = itemsList.length - 1; i >= 0; i -= 1) {
        if (itemsList[i].id == id) {
            itemsList.splice(i, 1);
        }
    }
    list.removeChild(li);
    localStorage.setItem('taskList', JSON.stringify(itemsList));
}
var dragSrcEl = null, pos = {}, ul;
function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    console.log(this);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    pos.left = e.pageX;
    pos.top = e.pageY;
}

function handleDragEnter(e) {
    // this / e.target is the current hover target.
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
    dragSrcEl.style.opacity = 1;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
    return false;
}

function handleDrop(e) {
    // this / e.target is current target element.

    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    var deltaX = Math.abs(pos.left - e.pageX);
    var deltaY = Math.abs(pos.top - e.pageY);
    var gipot = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    var sinA = deltaY / gipot;

    // Don't do anything if dropping the same column we're dragging.
//    if (sinA <= 0.707) { // > 45 grad
//        var list = document.getElementById('activeTaskList')
//        if (pos.left < e.pageX) {
//            console.log('move right');
//            var prevLi = this.previousSibling;
//            if (!prevLi) {
//                return;
//            }
//            ul = document.createElement('ul');
//            dragSrcEl.style.opacity = 1;
//            ul.appendChild(dragSrcEl)
//            prevLi.appendChild(ul);
//        }
//        if (pos.left > e.pageX) {
//            console.log('move left');
//            list.appendChild(dragSrcEl);
//        }
//
//        console.log('move horizontal');
//    } else {
        console.log('move vertical');
        if (dragSrcEl != this) {

            // Set the source column's HTML to the HTML of the columnwe dropped on.
            dragSrcEl.innerHTML = this.innerHTML;
            dragSrcEl.style.opacity = 1;
            this.innerHTML = e.dataTransfer.getData('text/html');
        }
//    }
    return false;
}

function handleDragEnd(e) {
    // this/e.target is the source node.
    var list = document.getElementById('activeTaskList').childNodes;
    list.forEach(function (item) {
        item.classList.remove('over');
    });
}

function search(form) {
    var name = form.name.value;
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    var data = itemsList.filter(function (item) {
        if (form.isActive.checked) {
            if (item.name.match(name) && !item.del) {
                console.log(item.del);
                return item;
            }
        } else {
            if (item.name.match(name)) {
                return item;
            }
        }
    });
    _refreshTaskList(data);
}

function clearSearch() {
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    _refreshTaskList(itemsList);
}

function showTaskNameEditInput(el) {
    var root = el.parentNode.parentNode.parentNode.id;
    if (root == 'closedTaskList') {
        return false;
    }
    var id = el.parentNode.parentNode.id.replace("task-id-", "");
    var inputTemplate = '<input onkeyup="event.preventDefault();window.editTaskName(this)" type="text" value="' + el.innerText + '" name="name" class="form-control" id="edit-text-' + id + '">';
    el.innerHTML = null;
    el.parentNode.innerHTML = inputTemplate;
}

function editTaskName(el) {
    if (event.keyCode != 13) {
        return false;
    }
    var template = ''
            + '<input style="z-index:1000" style="float:left" onchange="event.preventDefault();window.endTask(this);" type="checkbox" class="checkbox"><span ondblclick="event.preventDefault();window.showTaskNameEditInput(this)">' + el.value + '</span>'
            + ''
            + '<button type="button" class="close" style="display:none">'
            + '<span mouseover="event.preventDefault();window.showDellTaskButton(this.parentNode.parentNode.parentNode);" onclick="event.preventDefault();window.delTask(this)" aria-hidden="true">&times;</span>'
            + '</button>';
    var div = el.parentNode;
    div.innerHTML = null;
    div.innerHTML = template;

    var id = div.parentNode.id.replace('task-id-', '');
    console.log(id);
    var name = el.value;
    var itemsList = JSON.parse(localStorage.getItem('taskList')) || [];
    itemsList.forEach(function (item, i, arr) {
        if (item.id == id) {
            arr[i].name = name;
        }
    });
    localStorage.setItem('taskList', JSON.stringify(itemsList));
}


document.addEventListener("DOMContentLoaded", showTaskList);

/* private methods */
function _addListElement(id, name, del) {
    var newItem = document.createElement('li');
    newItem.id = "task-id-" + id;
    newItem.className = "task-item";
    newItem.draggable = del ? false : true;
    newItem.addEventListener('mouseover', showDelTaskButton, false);
    newItem.addEventListener('mouseout', removeDelTaskButton, false);
    if (!del) {
        newItem.addEventListener('dragstart', handleDragStart, false);
        newItem.addEventListener('dragenter', handleDragEnter, false);
        newItem.addEventListener('dragover', handleDragOver, false);
        newItem.addEventListener('dragleave', handleDragLeave, false);
        newItem.addEventListener('drop', handleDrop, false);
        newItem.addEventListener('dragend', handleDragEnd, false);
    }
    var disabled = del ? 'disabled="disabled"' : '';
    var checked = del ? 'checked="checked"' : '';
    var template = '<div class="checkbox">'
            + ''
            + '<input ' + checked + ' style="z-index:1000" ' + disabled + ' onchange="window.endTask(this);" type="checkbox" class="checkbox"><span ondblclick="event.preventDefault();window.showTaskNameEditInput(this)">' + name + '</span>'
            + '<button type="button" class="close" style="display:none">'
            + '<span mouseover="event.preventDefault();window.showDellTaskButton(this.parentNode.parentNode.parentNode);" onclick="event.preventDefault();window.delTask(this)" aria-hidden="true">&times;</span>'
            + '</button></div>';
    newItem.innerHTML = template;
    return newItem;
}

function _refreshTaskList(data) {
    var $activeTaskList = document.getElementById('activeTaskList');
    $activeTaskList.innerHTML = null;
    var $closedTaskList = document.getElementById('closedTaskList');
    $closedTaskList.innerHTML = null;
    data.forEach(function (item) {
        var element = _addListElement(item.id, item.name, item.del);
        if (item.del) {
            $closedTaskList.appendChild(element);
        } else {
            $activeTaskList.appendChild(element);
        }
    });
}

function _getDragDirection(el, event) {
    var _x = el.offsetLeft;
    var _y = el.offsetTop;
    var _curX = event.pageX;
    var _curY = event.pageY;
    var deltaX

    return {top: _y, left: _x};
}
//localStorage.clear();