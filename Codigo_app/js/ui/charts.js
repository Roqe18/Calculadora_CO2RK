/**
 * GESTIÓN DE GRÁFICOS INTERACTIVOS (CHART.JS) CON IDENTIDAD IDAF
 * Calculadora CO2RK
 */

export class ChartManager {
  constructor() {
    this.evolutionChart = null;
    this.creditsChart = null;
    this.poolsChart = null;

    // Paleta oficial IDAF
    this.colors = {
      darkGreen: '#005027',      // Pantone 357 C
      lightGreen: '#76B72B',     // Pantone 368 C
      darkGreenAlpha: 'rgba(0, 80, 39, 0.12)',
      lightGreenAlpha: 'rgba(118, 183, 43, 0.25)',
      baselineRed: '#dc2626',
      slate: '#6b7280'
    };
  }

  /**
   * Destruye gráficos previos si existen para evitar solapamientos
   */
  destroyCharts() {
    if (this.evolutionChart) this.evolutionChart.destroy();
    if (this.creditsChart) this.creditsChart.destroy();
    if (this.poolsChart) this.poolsChart.destroy();
  }

  /**
   * Actualiza el gráfico de evolución de stock de carbono (Línea Base vs Proyecto)
   */
  renderEvolutionChart(ctx, yearlyData, isAggregated = false) {
    if (this.evolutionChart) this.evolutionChart.destroy();

    const labels = yearlyData.map(d => `Año ${d.year}`);
    const baselineData = yearlyData.map(d => isAggregated ? d.baselineCO2Total : d.baselineCO2PerHa);
    const projectData = yearlyData.map(d => isAggregated ? d.projectCO2Total : d.projectCO2PerHa);
    const additionalData = yearlyData.map(d => isAggregated ? d.additionalCO2Total : d.additionalCO2PerHa);

    const unit = isAggregated ? 't CO₂e totales' : 't CO₂e / ha';

    /* global Chart */
    this.evolutionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `Proyecto IFM IDAF (${unit})`,
            data: projectData,
            borderColor: this.colors.darkGreen,
            backgroundColor: this.colors.darkGreenAlpha,
            borderWidth: 3,
            fill: false,
            tension: 0.2,
            pointRadius: 2.5,
            pointBackgroundColor: this.colors.darkGreen
          },
          {
            label: `Línea Base Reglamentaria (${unit})`,
            data: baselineData,
            borderColor: this.colors.baselineRed,
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.2,
            pointRadius: 2
          },
          {
            label: `Adicionalidad Neta Almacenada (${unit})`,
            data: additionalData,
            borderColor: this.colors.lightGreen,
            backgroundColor: this.colors.lightGreenAlpha,
            borderWidth: 2,
            fill: true,
            tension: 0.2,
            pointRadius: 1.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { size: 12, family: 'Poppins, sans-serif', weight: '500' }
            }
          },
          tooltip: {
            titleFont: { family: 'Poppins, sans-serif' },
            bodyFont: { family: 'Poppins, sans-serif' },
            callbacks: {
              label: (item) => `${item.dataset.label}: ${item.raw.toLocaleString('es-ES')} ${unit}`
            }
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: unit,
              font: { weight: 'bold', family: 'Poppins, sans-serif' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: { family: 'Poppins, sans-serif' }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Poppins, sans-serif' }
            }
          }
        }
      }
    });
  }

  /**
   * Actualiza el gráfico de generación de créditos de carbono (Anuales y Acumulados)
   */
  renderCreditsChart(ctx, yearlyData) {
    if (this.creditsChart) this.creditsChart.destroy();

    const labels = yearlyData.map(d => `Año ${d.year}`);
    const annualNet = yearlyData.map(d => d.annualNetCreditsTotal);
    const cumulativeNet = yearlyData.map(d => d.cumulativeNetCreditsTotal);

    /* global Chart */
    this.creditsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Créditos Netos Anuales (t CO₂e/año)',
            data: annualNet,
            backgroundColor: this.colors.lightGreen,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            type: 'line',
            label: 'Créditos Netos Acumulados (t CO₂e)',
            data: cumulativeNet,
            borderColor: this.colors.darkGreen,
            backgroundColor: this.colors.darkGreenAlpha,
            borderWidth: 3,
            fill: false,
            tension: 0.2,
            pointRadius: 2.5,
            pointBackgroundColor: this.colors.darkGreen,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { size: 12, family: 'Poppins, sans-serif', weight: '500' }
            }
          },
          tooltip: {
            titleFont: { family: 'Poppins, sans-serif' },
            bodyFont: { family: 'Poppins, sans-serif' }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Créditos anuales (t CO₂e)',
              font: { weight: 'bold', family: 'Poppins, sans-serif' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: { family: 'Poppins, sans-serif' }
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Créditos acumulados (t CO₂e)',
              font: { weight: 'bold', family: 'Poppins, sans-serif' }
            },
            ticks: {
              font: { family: 'Poppins, sans-serif' }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: { family: 'Poppins, sans-serif' }
            }
          }
        }
      }
    });
  }
}
