async function main() {
    const manhattan = await d3.json('./data/manhattan_boundary.geojson')
    const station_lookup = (await d3.csv('./data/station_lookup.csv')).filter(d => +d.lon !== 0).map(d => ({
        "type": "Feature",
        "properties": {
            name: d.name
        },
        "geometry": {
            "coordinates": [
                +d.lon, +d.lat
            ],
            "type": "Point"
        }
    }))
    const trips_counts = await d3.csv('./data/station_data_balance.csv')

    const petalPaths = [
        "M0 0 C50 50 50 100 0 100 C-50 100 -50 50 0 0",
        "M-35 0 C-25 25 25 25 35 0 C50 25 25 75 0 100 C-25 75 -50 25 -35 0",
        "M0,0 C50,40 50,70 20,100 L0,85 L-20,100 C-50,70 -50,40 0,0",
        "M0 0 C50 25 50 75 0 100 C-50 75 -50 25 0 0"
    ];


    const height = 600;
    const width = 1000;

    const projection = d3
        .geoMercator()
        .rotate([-0.1, -0.1, 0.01])
        .center([-74.01901002189861, 40.69020722446686])
        .scale(100000);

    // d3.geoAlbers()
    //   .rotate([120, 0, 0])
    //   .fitSize([width, height], manhattan)

    const geoPath = d3.geoPath().projection(projection);

    const svg = d3
        .select("#station-flower")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const manhattan_polygon = svg
        .selectAll(".boro")
        .data(manhattan.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", "#E9E9E9")
        .attr("stroke", "grey")
        .attr("stroke-width", 0.4);

    const flower = svg
        .selectAll("cicle")
        .data(station_lookup)
        .enter()
        .append("g")
        .attr("transform", (d) => {
            return `translate(${projection(d.geometry.coordinates).join(",")})`;
        });

    const scaleSize = d3
        .scaleLinear()
        .domain(d3.extent(trips_counts, (d) => +d.sum))
        .range([0.02, 0.5]);

    const scaleColor = d3
        .scaleQuantile()
        //.domain(d3.extent(trips_counts, (d) => +d.balance))
        .domain(trips_counts.map((d) => +d.ratio))
        .range(["#ca3b28", "#ed5728", "#f17e2e", "#f9bc9f", "white"]);

    const dot = flower.append("circle").attr("r", 1).attr("fill", "yellow");

    const petal = flower.append("g").each(function (d) {
        //filter stations that connect with station_b
        const station_name = d.properties.name;
        const connectors = trips_counts.filter((d) => d.station_b === station_name);
        const length = connectors.length;

        d3.select(this)
            .selectAll("path")
            .data(connectors)
            .enter()
            .append("path")
            .attr("d", petalPaths[0])
            .attr("fill", (d, i) => {
                const color = d3.rgb("CornflowerBlue");
                const { h, s, l } = d3.hsl(color);
                return scaleColor(+d.ratio);
            })
            .style("opacity", 0.8)
            .attr(
                "transform",
                (d, i) => `rotate(${i * (360 / length)})scale(${scaleSize(+d.sum)})`
            );
    });

}

main()
