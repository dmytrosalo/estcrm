const theme = {
  token: {
    colorPrimary: '#c9a962',
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#EFEFE8',
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    colorText: '#1a1a1a',
    colorTextSecondary: '#6b6b6b',
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Button: {
      colorPrimary: '#c9a962',
      algorithm: true,
      borderRadius: 8,
      controlHeight: 38,
    },
    Table: {
      headerBg: '#fafaf7',
      borderColor: '#f0f0ec',
      rowHoverBg: 'rgba(201, 169, 98, 0.04)',
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 14,
      paddingLG: 24,
    },
    Menu: {
      darkItemBg: '#232323',
      darkItemColor: 'rgba(255,255,255,0.65)',
      darkItemSelectedBg: 'rgba(201, 169, 98, 0.18)',
      darkItemSelectedColor: '#c9a962',
      darkItemHoverBg: 'rgba(255,255,255,0.04)',
      darkItemHoverColor: 'rgba(255,255,255,0.85)',
      itemMarginInline: 0,
      itemBorderRadius: 0,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 14,
    },
    Statistic: {
      titleFontSize: 13,
    },
  },
};

export default theme;
