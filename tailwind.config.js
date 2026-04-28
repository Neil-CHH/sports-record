/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 背景與邊框 — 雲都冷灰系,跟身高紀錄的奶油色明顯區隔
        cream: '#EDF1F5',
        warm: '#DDE3EC',
        // 主色(member 1 / 標題 / active state)— 夜場深藍
        coral: '#1E3A5F',
        coralDark: '#15294A',
        // 次色(member 2)— 球場照明的 cyan
        sky: '#4CB5E5',
        skyDark: '#2E94BD',
        // 文字
        ink: '#1A2740',
        mute: '#6B7B95',
        // accent — 螢光煤黃,FAB 與重點按鈕
        amber: '#FFB800',
        amberDark: '#E89E00'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"PingFang TC"',
          '"Noto Sans TC"',
          'sans-serif'
        ]
      },
      borderRadius: {
        ios: '1.25rem',
        iosLg: '1.75rem'
      },
      backdropBlur: {
        ios: '20px'
      },
      boxShadow: {
        ios: '0 1px 3px rgba(26,39,64,0.08), 0 8px 24px rgba(26,39,64,0.06)',
        iosLg: '0 4px 16px rgba(26,39,64,0.10), 0 20px 40px rgba(26,39,64,0.08)'
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        fadeIn: 'fadeIn 0.2s ease-out'
      }
    }
  },
  plugins: []
}
