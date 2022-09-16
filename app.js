const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json',true);
req.send();
req.onload = function(){
  const json = JSON.parse(req.responseText);

//SVG

const w = 1000
const h = 600
const padding = 50

const svg = d3.select("body")
                .append("svg")
                .attr("width", w)
                .attr("height", h)

//Axes

const xScale = d3.scaleLinear()
                .domain([d3.min(json, d => d["Year"]) - 1, d3.max(json, d => d["Year"]) + 1])
                .range([padding, w - padding])
const xAxis = d3.axisBottom(xScale)
                .tickFormat(t => parseInt(t) )
                             
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h-padding) + ")")
        .call(xAxis)
        

    //convert time to min:sec format and put them all in an array
    let formatTime = d3.timeFormat("%M:%S")
       //let parseTime = d3.timeParse("%M:%S")
    let parseTime =(rawTime) => {
        let time = new Date;
        let [mm, ss] = rawTime.split(":");
        time.setMinutes(mm);
        time.setSeconds(ss);
        return time;
      }
    const arrTime = json.map(d => (parseTime(d["Time"])))
   
    const yScale = d3.scaleTime()
                .domain(d3.extent(arrTime))
                .range([padding, h - padding])

    const yAxis = d3.axisLeft(yScale)
                     .tickFormat(d=>formatTime(d))
                     .tickValues(roundTicks(arrTime))
                     
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", "translate(" + padding + ", 0)")
            .call(yAxis)
            
//circles
    svg.selectAll("circle")
        .data(json)
        .enter()
        .append("circle")
        .attr("r", 7)
        .attr("cx", d => xScale(d["Year"]))
        .attr("cy", d=> yScale(parseTime(d["Time"])))
        .attr("class", "dot")
        .attr("data-xvalue", d => d["Year"])
        .attr("data-yvalue", d=> parseTime(d["Time"]))
        .style("fill", d => {
            if (d["Doping"] == "") {
                return "orange"
            }
            else {
                return "#8758FF"
            }
        })
//The data-yvalue and its corresponding dot should align with the corresponding point/value on the y-axis.
//tooltip
    const tooltip = d3.select("body")
                       .append("div")
                       .attr("id", "tooltip")
                       .style("opacity", "0")
                      
                    

    svg.selectAll("circle")
        .on("mouseover", (e, d) => {
         
          d3.select("#tooltip")
            .style("left", ((xScale(d["Year"]))+"px"))
            .style("top", (( yScale(parseTime(d["Time"])))+"px"))
            .attr("data-year", (d["Year"]) )
              .style("opacity", 1)
              .text(formulate(d))
        }) 
        .on("mouseout", (e, d) => {
            d3.select("#tooltip")
              .style("opacity", 0)
        })

//legend

d3.select("body")
        .append("ul")
        .attr("id", "legend")
        .append("li")
        .attr("id", "no-doping")
        .text("No doping allegations")
        .append("li")
        .attr("id", "doping")
        .text("Riders with doping allegations")

//text of the tooltip
function formulate(d) {
    return ((d["Name"]) + ": " + d["Nationality"] + "\n Year: " + d["Year"] + ", Time: " + d["Time"] +"\n\n" +d["Doping"])
             
}

//Ticks Value
function roundTicks (arrTime) {

   let min = (d3.extent(arrTime)[0])
   let max = (d3.extent(arrTime)[1])
    let ticks = []
    let a = d3.timeSecond.range(min, max);
    for (let i = 0; i < a.length; i ++){
        if ([0, 15, 30, 45].indexOf(parseInt((JSON.stringify(formatTime(a[i]))).split(":")[1])) != -1) {
            ticks.push(a[i])
        }
    }
    return (ticks)
}

};