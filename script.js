$(document).ready(function() {
  loadTodo();
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  var d = new Date();
  var day = days[d.getDay()];
  var date = d.getDate();
  var month = months[d.getMonth()];
  // Add day
  $(".head").append(day + ", <span>" + date + "th</span>");

  // Add month
  $("p.subtitle").text(month);

  // add and save
  let istrue = false;
  $(".circle").click(function(e) {
    if (istrue) {
      $(".input-wrapper").hide("slide");
      istrue = false;
      $(this).html("+");
    } else {
      $(".input-wrapper").show("slide");
      istrue = true;
      $(this).html("-");
    }
  });
  $(".todo-input").on("keypress", function(e) {
    if (e.which == 13) {
      saveTodo();
    }
  });

  $(document).on("click", ".task-title", function(event) {
    if (!$(this).hasClass("active")) {
      const todoId = $(this).attr("data-todo");
      $(this).addClass(" active");
      $(this)
        .next()
        .addClass(" select");
      changeStatusTodo(todoId, 1);
    } else {
      const todoId = $(this).attr("data-todo");
      changeStatusTodo(todoId, 0);
      $(this).removeClass(" active");
      $(this)
        .next()
        .removeClass(" select");
    }
  });

  $(document).on("click", ".remove", function(event) {
    const todoId = parseInt($(this).attr("data-todo"));
    $(this)
      .parent()
      .hide();
    removeTodo(todoId);
  });
});

function getUniqueNumber() {
  return Math.floor(Date.now() / 1000);
}

function getTotal() {
  chrome.storage.local.get(["todos"], function(result) {
    const todos = result.todos || [];
    const tasksLength = todos.length;
    const remainingTasks = todos.filter(todo => todo.status == 0);
    chrome.browserAction.setBadgeText({
      text: `${remainingTasks.length}+` || 0
    });
    const text = tasksLength > 0 ? "Tasks" : "Task";
    $(".task").html(tasksLength + " " + text);
  });
}

function loadTodo() {
  chrome.storage.local.get(["todos"], function(result) {
    const todos = result.todos || [];
    const tasksLength = todos.length;
    const remainingTasks = todos.filter(todo => todo.status == 0);
    chrome.browserAction.setBadgeText({
      text: `${remainingTasks.length}+` || 0
    });
    const text = tasksLength > 0 ? "Tasks" : "Task";
    $(".task").html(tasksLength + " " + text);

    todos.forEach(function(todo) {
      const active = todo.status == 1 ? " active" : " ";
      const select = todo.status == 1 ? " select" : " ";
      return $(".wrapper").prepend(`
        <div class="todo-list">
          <p  data-todo="${todo.id}" class="task-title ${active}">${todo.name}</p>
          <a class="remove ${select}" data-todo="${todo.id}">X</a>
        </div>
      `);
    });
  });
}

function saveTodo() {
  var todo = $(".todo-input").val();
  chrome.storage.local.get(["todos"], function(storage) {
    let resultTodos = storage.todos;
    if (!resultTodos) {
      resultTodos = [];
    }
    const todoData = { id: getUniqueNumber(), status: 0, name: todo };
    todo = JSON.stringify(todoData);
    resultTodos.push(JSON.parse(todo));
    chrome.storage.local.set(
      {
        todos: resultTodos
      },
      function() {
        console.log("Settings saved");
        getTotal();
        $(".todo-input").val("");
        $(".wrapper").prepend(`
          <div class="todo-list">
            <p data-todo="${todoData.id}" class="task-title">${todoData.name}</p>
            <a class="remove" data-todo="${todoData.id}">X</a>
          </div>
        `);
      }
    );
  });
}

function removeTodo(todoId) {
  chrome.storage.local.get(["todos"], function(result) {
    const todos = result.todos || [];
    const filterTodos = todos.filter(function(todo) {
      return todo.id !== todoId;
    });
    chrome.storage.local.set(
      {
        todos: filterTodos
      },
      function() {
        getTotal();
      }
    );
  });
}

function changeStatusTodo(todoId, status) {
  chrome.storage.local.get(["todos"], function(result) {
    let todos = result.todos || [];
    const findIndex = todos.findIndex(todo => todo.id == todoId);
    const findTodo = todos.find(function(todo) {
      return todo.id == todoId;
    });
    todos[findIndex] = { id: findTodo.id, status: status, name: findTodo.name };
    chrome.storage.local.set(
      {
        todos: todos
      },
      function() {
        getTotal();
      }
    );
  });
}
