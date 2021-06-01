import BinaryHeap from "./heap.js";

var curr_data;
const container1 = document.getElementById("mynetwork1");
const container2 = document.getElementById("mynetwork2");
const submit = document.getElementById("submit");
const genRan = document.getElementById("generate-random");
const solve = document.getElementById("solve");
const temptext1 = document.getElementById("temptext1");
const temptext2 = document.getElementById("temptext2");

const options = {
  edges: {
    arrows: {
      to: true,
    },
    labelHighlightBold: true,
    font: {
      size: 20,
    },
  },
  nodes: {
    font: "12px arial red",
    scaling: {
      label: true,
    },
    shape: "icon",
    icon: {
      face: "FontAwesome",
      code: "\uf183",
      size: 50,
      color: "#991133",
    },
  },
};

// initialize your network!
let network2 = new vis.Network(container2);
network2.setOptions(options);
let network1 = new vis.Network(container1);
network1.setOptions(options);

var arrValues;
var person;

function createData() {
  const sz = person.length;
  let nodes = [];
  for (let i = 0; i < sz; i++) {
    nodes.push({ id: i, label: person[i] });
  }
  nodes = new vis.DataSet(nodes);

  // Dynamically creating edges with random amount to be paid from one to another friend
  let edges = [];
  for (var i = 0; i < arrValues.length; i += 3) {
    edges.push({
      from: person.indexOf(arrValues[i]),
      to: person.indexOf(arrValues[i + 1]),
      label: arrValues[i + 2],
    });
  }

  let data = {
    nodes: nodes,
    edges: edges,
  };
  return data;
}

function createRandData() {
  const sz = Math.floor(Math.random() * 8) + 2;
  let nodes = [];
  for (var i = 0; i < sz; i++) {
    var id = i + 1;
    nodes.push({ id: i, label: "Person " + id });
  }
  nodes = new vis.DataSet(nodes);

  // Dynamically creating edges with random amount to be paid from one to another friend
  const edges = [];
  for (let i = 0; i < sz; i++) {
    for (let j = i + 1; j < sz; j++) {
      var id = i;
      // Modifies the amount of edges added in the graph
      if (Math.random() > 0.5) {
        // Controls the direction of cash flow on edge
        if (Math.random() > 0.5)
          edges.push({
            from: i,
            to: j,
            label: String(Math.floor(Math.random() * 100) + 1),
          });
        else
          edges.push({
            from: j,
            to: i,
            label: String(Math.floor(Math.random() * 100) + 1),
          });
      }
    }
  }
  const data = {
    nodes: nodes,
    edges: edges,
  };
  return data;
}

submit.onclick = function () {
  arrValues = [];
  person = [];
  var myTab = document.getElementById("cashTable");
  var temp = new Array();

  for (var row = 1; row <= myTab.rows.length - 1; row++) {
    for (var c = 1; c < myTab.rows[row].cells.length; c++) {
      var element = myTab.rows.item(row).cells[c];
      if (element.childNodes[0].getAttribute("type") == "text") {
        arrValues.push(element.childNodes[0].value);
        if (c != myTab.rows[row].cells.length - 1)
          temp.push(element.childNodes[0].value);
      }
    }
  }
  person = [...new Set(temp)];

  container1.style.display = "inline";
  temptext1.style.display = "none";
  container2.style.display = "none";
  const data = createData();
  curr_data = data;
  network1.setData(data);
};

genRan.onclick = function () {
  container1.style.display = "inline";
  temptext1.style.display = "none";
  container2.style.display = "none";
  const data = createRandData();
  curr_data = data;
  network1.setData(data);
};

solve.onclick = function () {
  temptext2.style.display = "none";
  container2.style.display = "inline";
  const solvedData = solveData();
  network2.setData(solvedData);
};

function solveData() {
  let data = curr_data;
  const sz = data["nodes"].length;
  const vals = Array(sz).fill(0);
  // Calculating net balance of each person
  for (let i = 0; i < data["edges"].length; i++) {
    const edge = data["edges"][i];
    vals[edge["to"]] += parseInt(edge["label"]);
    vals[edge["from"]] -= parseInt(edge["label"]);
  }

  const pos_heap = new BinaryHeap();
  const neg_heap = new BinaryHeap();

  for (let i = 0; i < sz; i++) {
    if (vals[i] > 0) {
      pos_heap.insert([vals[i], i]);
    } else {
      neg_heap.insert([-vals[i], i]);
      vals[i] *= -1;
    }
  }

  const new_edges = [];
  while (!pos_heap.empty() && !neg_heap.empty()) {
    const mx = pos_heap.extractMax();
    const mn = neg_heap.extractMax();

    const amt = Math.min(mx[0], mn[0]);
    const to = mx[1];
    const from = mn[1];

    new_edges.push({ from: from, to: to, label: String(Math.abs(amt)) });
    vals[to] -= amt;
    vals[from] -= amt;

    if (mx[0] > mn[0]) {
      pos_heap.insert([vals[to], to]);
    } else if (mx[0] < mn[0]) {
      neg_heap.insert([vals[from], from]);
    }
  }

  data = {
    nodes: data["nodes"],
    edges: new_edges,
  };
  return data;
}
