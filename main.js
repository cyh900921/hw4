document.addEventListener("DOMContentLoaded", async function() {
    const csvFileName = 'avgIQpercountry.csv';

    try {
        // 使用 fetch 從 CSV 檔案中讀取數據
        const response = await fetch(csvFileName);
        const data = await response.text();

        // 將 CSV 轉換成 JSON 格式
        const parsedData = Papa.parse(data, { header: true });

        // 將數據存儲到 iqData 中
        const iqData = {
            Country: parsedData.data.map(row => row.Country),
            Continent: parsedData.data.map(row => row.Continent),
            AverageIQ: parsedData.data.map(row => parseFloat(row.AverageIQ)),
            NobelPrices: parsedData.data.map(row => parseInt(row.NobelPrices)),
        };

        // 截取前30個項目
        const top30Indices = Array.from({ length: 30 }, (_, i) => i);

        // 按照 "Continent" 進行統計
        const continents = [...new Set(iqData.Continent)];
        const averageIQByContinent = continents.map(continent => {
            const continentIndices = iqData.Continent.map((c, index) => c === continent ? index : -1).filter(index => index !== -1);
            const continentIQs = continentIndices.map(index => iqData.AverageIQ[index]);
            
            // 計算平均 IQ
            const averageIQ = continentIQs.reduce((sum, iq) => sum + iq, 0) / continentIQs.length;
            const displayContinent = continent.split('/')[0];

            return { continent: displayContinent, averageIQ };
        });

        // 按照 "Continent" 進行統計諾貝爾獎次數
        const nobelPricesByContinent = continents.map(continent => {
            const continentIndices = iqData.Continent.map((c, index) => c === continent ? index : -1).filter(index => index !== -1);
            const continentNobelPrices = continentIndices.map(index => iqData.NobelPrices[index]);
            
            // 計算獲得諾貝爾獎的總次數
            const totalNobelPrices = continentNobelPrices.reduce((sum, count) => sum + count, 0);
            return { continent, totalNobelPrices };
        });

        // 創建折線圖
        const lineChart = {
            x: top30Indices.map(index => iqData.Country[index]),
            y: top30Indices.map(index => iqData.AverageIQ[index]),
            type: 'scatter',
            mode: 'lines',
            name: 'Average IQ',
            line: { color: 'blue' },
            text: top30Indices.map(index => `Country: ${iqData.Country[index]}<br>Average IQ: ${iqData.AverageIQ[index]}`),
        };

        // 創建長條圖
        const barChart = {
            x: continents,
            y: averageIQByContinent.map(item => item.averageIQ),
            type: 'bar',
            name: 'Average IQ by Continent',
            marker: { color: 'lightblue' },
            text: averageIQByContinent.map(item => `Continent: ${item.continent}<br>Average IQ: ${item.averageIQ}`),
        };

        // 創建圓餅圖 (每個洲的諾貝爾獎次數)
        const nobelPieChart = {
            labels: nobelPricesByContinent.map(item => item.continent),
            values: nobelPricesByContinent.map(item => item.totalNobelPrices),
            type: 'pie',
            text: nobelPricesByContinent.map(item => `Continent: ${item.continent}<br>Total Nobel Prizes: ${item.totalNobelPrices}`),
        };

        const lineLayout = {
            title: 'Top 30 Average IQ by Country',
            annotations: [
                {
                    x: 0.5,
                    y: 1.05,
                    xref: 'paper',
                    yref: 'paper',
                    text: '這是我在 Kaggle 當中所找到的全球 IQ 值，我做了以下三個不同的圖表來顯示。',
                    showarrow: false,
                    font: {
                        size: 12,
                        color: 'black'
                    }
                }
            ]
        };

        const barLayout = {
            title: 'Average IQ by Continent',
            annotations: [
                // 如果有的話，在這裡加入文字
            ]
        };

        const nobelPieLayout = {
            title: 'Nobel Prize Distribution by Continent',
            annotations: [
                // 如果有的話，在這裡加入文字
            ]
        };

        Plotly.newPlot('myGraph', [lineChart], lineLayout);
        Plotly.newPlot('myGraph-bar', [barChart], barLayout);
        Plotly.newPlot('myGraph-nobel-pie', [nobelPieChart], nobelPieLayout);

    } catch (error) {
        console.error('Error loading CSV file:', error);
    }
});
