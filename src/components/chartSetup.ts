import {
  Chart as ChartJS,
  BarController,
  DoughnutController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all required Chart.js controllers and elements once
ChartJS.register(
  BarController,
  DoughnutController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global styling defaults for clean automotive workshop aesthetic
ChartJS.defaults.color = '#94a3b8'; // Slate 400
ChartJS.defaults.font.family = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
ChartJS.defaults.font.size = 11;
ChartJS.defaults.plugins.tooltip.backgroundColor = '#0f172a';
ChartJS.defaults.plugins.tooltip.titleColor = '#f8fafc';
ChartJS.defaults.plugins.tooltip.bodyColor = '#e2e8f0';
ChartJS.defaults.plugins.tooltip.borderColor = '#334155';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
