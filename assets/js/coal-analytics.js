(() => {
  'use strict';

  const DATA = {
    variables: ['Feed Ash', 'Feed Rate', 'Density', 'Pressure'],
    influence: {
      nuts: { xgboost: [61, 17, 14, 8], monteCarlo: [33, 29, 20, 18] },
      peas: { xgboost: [58, 18, 16, 7], monteCarlo: [35, 28, 20, 18] }
    },
    monteCarlo: {
      simulations: 10000,
      nuts: {
        mean: 20.75,
        minimum: 16.535,
        maximum: 24.947,
        standardDeviation: 1.461,
        interval95: [17.996, 23.527],
        aboveSpecification: 2121,
        exceedanceProbability: 21,
        meetingProbability: 79
      },
      peas: { minimum: 16.549, maximum: 23.663, standardDeviation: 1.253, mean: 20.107 }
    },
    scenarios: {
      categories: ['High Feed Ash', 'High Feed Rate', 'Low Feed Ash'],
      peasAsh: [22.66, 21.32, 19.12],
      nutsAsh: [23.67, 22.27, 19.66]
    },
    specification: 22
  };

  const charts = [];
  let colors;
  let resizeObserver;
  let resizeListener;

  function getColors() {
    const style = window.getComputedStyle(document.documentElement);
    const value = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
      accent: value('--accent', '#168468'),
      muted: value('--muted', '#68726d'),
      text: value('--text', '#202722'),
      border: value('--border', '#dce2de'),
      surface: value('--surface', '#ffffff'),
      secondary: '#8c9b92',
      warning: '#b64736'
    };
  }

  function commonOption(description) {
    return {
      animation: true,
      animationDuration: 600,
      aria: { enabled: true, description },
      textStyle: { fontFamily: 'Arial, Helvetica, sans-serif', color: colors.muted },
      tooltip: {
        trigger: 'axis',
        confine: true,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        textStyle: { color: colors.text },
        axisPointer: { type: 'shadow' }
      }
    };
  }

  function buildInfluenceOption(product) {
    const productData = DATA.influence[product];
    const productName = product === 'nuts' ? 'Nuts Ash' : 'Peas Ash';
    return {
      ...commonOption(`${productName} XGBoost and Monte Carlo influence by process variable, in percent.`),
      color: [colors.accent, colors.secondary],
      legend: { top: 4, right: 8, itemWidth: 12, itemHeight: 10, textStyle: { color: colors.muted, fontSize: 11 } },
      grid: { left: 92, right: 42, top: 48, bottom: 48 },
      xAxis: {
        type: 'value', min: 0, max: 70, interval: 10,
        name: 'Influence / contribution (%)', nameLocation: 'middle', nameGap: 32,
        axisLabel: { color: colors.muted, formatter: '{value}%' },
        axisLine: { lineStyle: { color: colors.border } }, axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: colors.border, type: 'dashed' } }
      },
      yAxis: {
        type: 'category', inverse: true, data: DATA.variables,
        axisLabel: { color: colors.text, fontSize: 12 }, axisLine: { show: false }, axisTick: { show: false }
      },
      series: [
        {
          name: 'XGBoost', type: 'bar', data: productData.xgboost, barMaxWidth: 18, barGap: '32%',
          itemStyle: { borderRadius: [0, 5, 5, 0] },
          label: { show: true, position: 'right', formatter: '{c}%', color: colors.text, fontWeight: 700, fontSize: 11 },
          emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(28,55,41,.2)' } }
        },
        {
          name: 'Monte Carlo', type: 'bar', data: productData.monteCarlo, barMaxWidth: 18,
          itemStyle: { borderRadius: [0, 5, 5, 0] },
          label: { show: true, position: 'right', formatter: '{c}%', color: colors.text, fontWeight: 700, fontSize: 11 },
          emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(28,55,41,.2)' } }
        }
      ]
    };
  }

  function buildRiskOption() {
    const risk = DATA.monteCarlo.nuts;
    const [intervalStart, intervalEnd] = risk.interval95;
    const markerData = [
      { name: 'Minimum', value: [risk.minimum, 0], itemStyle: { color: colors.muted } },
      { name: 'Mean', value: [risk.mean, 0], symbol: 'diamond', symbolSize: 18, itemStyle: { color: colors.accent, borderColor: '#ffffff', borderWidth: 2 } },
      { name: 'Maximum', value: [risk.maximum, 0], itemStyle: { color: colors.text } }
    ];
    return {
      ...commonOption(`Nuts Ash Monte Carlo summary from ${DATA.monteCarlo.simulations.toLocaleString()} simulations. Minimum ${risk.minimum} percent, 95 percent prediction interval ${intervalStart} to ${intervalEnd} percent, mean ${risk.mean} percent, specification ${DATA.specification} percent, maximum ${risk.maximum} percent.`),
      grid: { left: 42, right: 42, top: 68, bottom: 64 },
      tooltip: {
        ...commonOption('').tooltip,
        trigger: 'item',
        formatter: params => {
          if (params.name === 'Specification') return `<strong>Specification</strong><br>${DATA.specification.toFixed(2)}% threshold`;
          if (params.seriesName === '95% prediction interval') return `<strong>95% prediction interval</strong><br>${intervalStart.toFixed(3)}% to ${intervalEnd.toFixed(3)}%`;
          if (params.seriesName === 'Reported minimum to maximum') return `<strong>Reported range</strong><br>${risk.minimum.toFixed(3)}% to ${risk.maximum.toFixed(3)}%`;
          const metric = params.data && params.data.name;
          return `<strong>${metric}</strong><br>${Number(params.value[0]).toFixed(metric === 'Mean' ? 2 : 3)}%`;
        }
      },
      xAxis: {
        type: 'value', min: 15, max: 26, interval: 1,
        name: 'Nuts Ash (%)', nameLocation: 'middle', nameGap: 34,
        axisLabel: { color: colors.muted, formatter: '{value}%' },
        axisLine: { lineStyle: { color: colors.border } }, axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: colors.border, type: 'dashed' } }
      },
      yAxis: { type: 'category', data: ['Nuts Ash summary'], axisLabel: { color: colors.text, fontWeight: 600 }, axisLine: { show: false }, axisTick: { show: false } },
      series: [
        {
          name: 'Reported minimum to maximum', type: 'line', data: [[risk.minimum, 0], [risk.maximum, 0]],
          symbol: 'none', lineStyle: { color: '#c8d0ca', width: 12, cap: 'round' },
          markArea: { silent: true, label: { show: false }, itemStyle: { color: 'rgba(104,114,109,.08)' }, data: [[{ xAxis: risk.minimum }, { xAxis: risk.maximum }]] }
        },
        {
          name: '95% prediction interval', type: 'line', data: [[intervalStart, 0], [intervalEnd, 0]],
          symbol: 'none', lineStyle: { color: colors.accent, width: 14, cap: 'round' },
          emphasis: { lineStyle: { color: '#0e7157', width: 18 } },
          markArea: { silent: true, label: { show: false }, itemStyle: { color: 'rgba(22,132,104,.14)' }, data: [[{ xAxis: intervalStart }, { xAxis: intervalEnd }]] }
        },
        {
          name: 'Summary markers', type: 'scatter', data: markerData, symbolSize: 13, z: 5,
          label: { show: true, position: 'top', distance: 13, formatter: params => `${params.data.name}\n${Number(params.value[0]).toFixed(params.data.name === 'Mean' ? 2 : 3)}%`, color: colors.text, fontSize: 10, fontWeight: 700 },
          emphasis: { scale: 1.25, focus: 'self' },
          markLine: {
            symbol: ['none', 'none'],
            label: { show: true, formatter: '22.00% SPECIFICATION', position: 'insideEndTop', color: '#ffffff', fontWeight: 800, fontSize: 10, backgroundColor: colors.warning, padding: [5, 8], borderRadius: 4 },
            lineStyle: { color: colors.warning, width: 4, type: 'solid' }, data: [{ name: 'Specification', xAxis: DATA.specification }]
          }
        }
      ]
    };
  }

  function buildScenarioOption() {
    const scenarioStatus = (value) => value > DATA.specification ? 'Exceeds specification' : 'Within specification';
    return {
      ...commonOption('Grouped comparison of Peas Ash and Nuts Ash for three operating scenarios, including the 22 percent specification threshold.'),
      color: [colors.accent, colors.secondary],
      legend: { top: 4, right: 8, itemWidth: 12, itemHeight: 10, textStyle: { color: colors.muted, fontSize: 11 } },
      tooltip: {
        ...commonOption('').tooltip,
        formatter: params => {
          const scenario = params[0] ? params[0].axisValue : '';
          const rows = params.map(item => {
            const value = Number(item.value);
            return `${item.marker} ${item.seriesName}: <strong>${value.toFixed(2)}%</strong> (${scenarioStatus(value)})`;
          }).join('<br>');
          return `<strong>${scenario}</strong><br>${rows}<br><span style="color:${colors.warning};font-weight:700">Specification: ${DATA.specification.toFixed(2)}%</span>`;
        }
      },
      grid: { left: 68, right: 42, top: 50, bottom: 78 },
      xAxis: {
        type: 'category', data: DATA.scenarios.categories,
        axisLabel: { color: colors.text, interval: 0, fontSize: 11, width: 112, overflow: 'break' },
        axisLine: { lineStyle: { color: colors.border } }, axisTick: { show: false }
      },
      yAxis: {
        type: 'value', min: 0, max: 28, interval: 4, name: 'Ash (%)', nameGap: 36,
        axisLabel: { color: colors.muted, formatter: '{value}%' },
        axisLine: { show: false }, axisTick: { show: false },
        splitLine: { show: true, lineStyle: { color: colors.border, type: 'dashed' } }
      },
      series: [
        {
          name: 'Peas Ash', type: 'bar', data: DATA.scenarios.peasAsh, barMaxWidth: 34,
          itemStyle: { borderRadius: [5, 5, 0, 0] },
          label: { show: true, position: 'top', formatter: params => `${Number(params.value).toFixed(2)}%`, color: colors.text, fontWeight: 700, fontSize: 10 },
          markLine: { symbol: ['none', 'none'], label: { show: true, formatter: '22% SPECIFICATION', position: 'insideEndTop', color: '#ffffff', fontWeight: 800, fontSize: 10, backgroundColor: colors.warning, padding: [4, 7], borderRadius: 4 }, lineStyle: { color: colors.warning, width: 3, type: 'solid' }, data: [{ name: 'Specification', yAxis: DATA.specification }] },
          emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(31,62,44,.2)' } }
        },
        {
          name: 'Nuts Ash', type: 'bar', data: DATA.scenarios.nutsAsh, barMaxWidth: 34,
          itemStyle: { borderRadius: [5, 5, 0, 0] },
          label: { show: true, position: 'top', formatter: params => `${Number(params.value).toFixed(2)}%`, color: colors.text, fontWeight: 700, fontSize: 10 },
          emphasis: { focus: 'series', itemStyle: { shadowBlur: 8, shadowColor: 'rgba(31,62,44,.2)' } }
        }
      ]
    };
  }

  function initializeChart(containerId, option) {
    const container = document.getElementById(containerId);
    if (!container || !window.echarts) return null;
    try {
      const chart = window.echarts.init(container, null, { renderer: 'svg' });
      chart.setOption(option);
      const fallback = container.querySelector('.coal-chart-fallback');
      if (fallback) fallback.hidden = true;
      charts.push({ chart, container });
      return chart;
    } catch (error) {
      const fallback = container.querySelector('.coal-chart-fallback');
      if (fallback) fallback.hidden = false;
      return null;
    }
  }

  function initializeInfluenceCharts() {
    initializeChart('coal-nuts-influence-chart', buildInfluenceOption('nuts'));
    initializeChart('coal-peas-influence-chart', buildInfluenceOption('peas'));
  }

  function initializeRiskChart() {
    initializeChart('coal-risk-chart', buildRiskOption());
  }

  function initializeScenarioChart() {
    initializeChart('coal-scenario-chart', buildScenarioOption());
  }

  function handleResize() {
    charts.forEach(({ chart }) => chart.resize());
  }

  function registerResizeHandling() {
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize);
      charts.forEach(({ container }) => resizeObserver.observe(container));
    } else {
      resizeListener = handleResize;
      window.addEventListener('resize', resizeListener, { passive: true });
    }
  }

  function disposeCharts() {
    if (resizeObserver) resizeObserver.disconnect();
    if (resizeListener) window.removeEventListener('resize', resizeListener);
    charts.forEach(({ chart }) => chart.dispose());
    charts.length = 0;
  }

  function initializeCoalAnalytics() {
    if (!document.querySelector('.coal-detail') || !window.echarts) return;
    colors = getColors();
    initializeInfluenceCharts();
    initializeRiskChart();
    initializeScenarioChart();
    registerResizeHandling();
    window.addEventListener('pagehide', disposeCharts, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCoalAnalytics, { once: true });
  } else {
    initializeCoalAnalytics();
  }
})();
