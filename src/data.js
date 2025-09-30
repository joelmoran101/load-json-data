// src/data.js
export const plotlyData = {
  "data": [
    {
      "hovertemplate": "%{hovertext}\u003cextra\u003e\u003c\u002fextra\u003e",
      "hovertext": [
        "Company: AAPL\u003cbr\u003eQuarter: 2018 Q4\u003cbr\u003eCCP: $ 86427 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2019 Q1\u003cbr\u003eCCP: $ 80092 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2019 Q2\u003cbr\u003eCCP: $ 94614 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2019 Q3\u003cbr\u003eCCP: $ 100557 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2019 Q4\u003cbr\u003eCCP: $ 107162 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2020 Q1\u003cbr\u003eCCP: $ 94051 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2020 Q2\u003cbr\u003eCCP: $ 93025 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2020 Q3\u003cbr\u003eCCP: $ 90943 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2020 Q4\u003cbr\u003eCCP: $ 76826 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2021 Q1\u003cbr\u003eCCP: $ 69834 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2021 Q2\u003cbr\u003eCCP: $ 61696 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2021 Q3\u003cbr\u003eCCP: $ 62639 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2021 Q4\u003cbr\u003eCCP: $ 63913 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2022 Q1\u003cbr\u003eCCP: $ 51511 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2022 Q2\u003cbr\u003eCCP: $ 48231 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2022 Q3\u003cbr\u003eCCP: $ 48304 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2022 Q4\u003cbr\u003eCCP: $ 51355 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2023 Q1\u003cbr\u003eCCP: $ 55872 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2023 Q2\u003cbr\u003eCCP: $ 62482 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2023 Q3\u003cbr\u003eCCP: $ 61555 M",
        "Company: AAPL\u003cbr\u003eQuarter: 2023 Q4\u003cbr\u003eCCP: $ 73100 M"
      ],
      "line": {
        "color": "#636EFA",
        "dash": "solid",
        "width": 2
      },
      "marker": {
        "color": "#636EFA",
        "line": {
          "color": "black",
          "width": 2
        },
        "opacity": 0.8
      },
      "mode": "lines",
      "name": "AAPL_CCP",
      "showlegend": true,
      "x": [
        "2018-12-31T00:00:00",
        "2019-03-31T00:00:00",
        "2019-06-30T00:00:00",
        "2019-09-30T00:00:00",
        "2019-12-31T00:00:00",
        "2020-03-31T00:00:00",
        "2020-06-30T00:00:00",
        "2020-09-30T00:00:00",
        "2020-12-31T00:00:00",
        "2021-03-31T00:00:00",
        "2021-06-30T00:00:00",
        "2021-09-30T00:00:00",
        "2021-12-31T00:00:00",
        "2022-03-31T00:00:00",
        "2022-06-30T00:00:00",
        "2022-09-30T00:00:00",
        "2022-12-31T00:00:00",
        "2023-03-31T00:00:00",
        "2023-06-30T00:00:00",
        "2023-09-30T00:00:00",
        "2023-12-31T00:00:00"
      ],
      "y": [
        86427.0,
        80092.0,
        94614.0,
        100557.0,
        107162.0,
        94051.0,
        93025.0,
        90943.0,
        76826.0,
        69834.0,
        61696.0,
        62639.0,
        63913.0,
        51511.0,
        48231.0,
        48304.0,
        51355.0,
        55872.0,
        62482.0,
        61555.0,
        73100.0
      ],
      "type": "scatter"
    }
  ],
  "layout": {
    "height": 600,
    "width": 1200,
    "template": {
      "data": {
        "histogram2dcontour": [
          {
            "type": "histogram2dcontour",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "choropleth": [
          {
            "type": "choropleth",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            }
          }
        ],
        "histogram2d": [
          {
            "type": "histogram2d",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "heatmap": [
          {
            "type": "heatmap",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "heatmapgl": [
          {
            "type": "heatmapgl",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "contourcarpet": [
          {
            "type": "contourcarpet",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            }
          }
        ],
        "contour": [
          {
            "type": "contour",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "surface": [
          {
            "type": "surface",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            },
            "colorscale": [
              [0.0, "#0d0887"],
              [0.1111111111111111, "#46039f"],
              [0.2222222222222222, "#7201a8"],
              [0.3333333333333333, "#9c179e"],
              [0.4444444444444444, "#bd3786"],
              [0.5555555555555556, "#d8576b"],
              [0.6666666666666666, "#ed7953"],
              [0.7777777777777778, "#fb9f3a"],
              [0.8888888888888888, "#fdca26"],
              [1.0, "#f0f921"]
            ]
          }
        ],
        "mesh3d": [
          {
            "type": "mesh3d",
            "colorbar": {
              "outlinewidth": 0,
              "ticks": ""
            }
          }
        ],
        "scatter": [
          {
            "fillpattern": {
              "fillmode": "overlay",
              "size": 10,
              "solidity": 0.2
            },
            "type": "scatter"
          }
        ],
        "parcoords": [
          {
            "type": "parcoords",
            "line": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scatterpolargl": [
          {
            "type": "scatterpolargl",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "bar": [
          {
            "error_x": {
              "color": "#2a3f5f"
            },
            "error_y": {
              "color": "#2a3f5f"
            },
            "marker": {
              "line": {
                "color": "#E5ECF6",
                "width": 0.5
              },
              "pattern": {
                "fillmode": "overlay",
                "size": 10,
                "solidity": 0.2
              }
            },
            "type": "bar"
          }
        ],
        "scattergeo": [
          {
            "type": "scattergeo",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scatterpolar": [
          {
            "type": "scatterpolar",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "histogram": [
          {
            "marker": {
              "pattern": {
                "fillmode": "overlay",
                "size": 10,
                "solidity": 0.2
              }
            },
            "type": "histogram"
          }
        ],
        "scattergl": [
          {
            "type": "scattergl",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scatter3d": [
          {
            "type": "scatter3d",
            "line": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            },
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scattermapbox": [
          {
            "type": "scattermapbox",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scatterternary": [
          {
            "type": "scatterternary",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "scattercarpet": [
          {
            "type": "scattercarpet",
            "marker": {
              "colorbar": {
                "outlinewidth": 0,
                "ticks": ""
              }
            }
          }
        ],
        "carpet": [
          {
            "aaxis": {
              "endlinecolor": "#2a3f5f",
              "gridcolor": "white",
              "linecolor": "white",
              "minorgridcolor": "white",
              "startlinecolor": "#2a3f5f"
            },
            "baxis": {
              "endlinecolor": "#2a3f5f",
              "gridcolor": "white",
              "linecolor": "white",
              "minorgridcolor": "white",
              "startlinecolor": "#2a3f5f"
            },
            "type": "carpet"
          }
        ],
        "table": [
          {
            "cells": {
              "fill": {
                "color": "#EBF0F8"
              },
              "line": {
                "color": "white"
              }
            },
            "header": {
              "fill": {
                "color": "#C8D4E3"
              },
              "line": {
                "color": "white"
              }
            },
            "type": "table"
          }
        ],
        "barpolar": [
          {
            "marker": {
              "line": {
                "color": "#E5ECF6",
                "width": 0.5
              },
              "pattern": {
                "fillmode": "overlay",
                "size": 10,
                "solidity": 0.2
              }
            },
            "type": "barpolar"
          }
        ],
        "pie": [
          {
            "automargin": true,
            "type": "pie"
          }
        ]
      },
      "layout": {
        "autotypenumbers": "strict",
        "colorway": [
          "#636efa",
          "#EF553B",
          "#00cc96",
          "#ab63fa",
          "#FFA15A",
          "#19d3f3",
          "#FF6692",
          "#B6E880",
          "#FF97FF",
          "#FECB52"
        ],
        "font": {
          "color": "#2a3f5f"
        },
        "hovermode": "closest",
        "hoverlabel": {
          "align": "left"
        },
        "paper_bgcolor": "white",
        "plot_bgcolor": "#E5ECF6",
        "polar": {
          "bgcolor": "#E5ECF6",
          "angularaxis": {
            "gridcolor": "white",
            "linecolor": "white",
            "ticks": ""
          },
          "radialaxis": {
            "gridcolor": "white",
            "linecolor": "white",
            "ticks": ""
          }
        },
        "ternary": {
          "bgcolor": "#E5ECF6",
          "aaxis": {
            "gridcolor": "white",
            "linecolor": "white",
            "ticks": ""
          },
          "baxis": {
            "gridcolor": "white",
            "linecolor": "white",
            "ticks": ""
          },
          "caxis": {
            "gridcolor": "white",
            "linecolor": "white",
            "ticks": ""
          }
        },
        "coloraxis": {
          "colorbar": {
            "outlinewidth": 0,
            "ticks": ""
          }
        },
        "colorscale": {
          "sequential": [
            [0.0, "#0d0887"],
            [0.1111111111111111, "#46039f"],
            [0.2222222222222222, "#7201a8"],
            [0.3333333333333333, "#9c179e"],
            [0.4444444444444444, "#bd3786"],
            [0.5555555555555556, "#d8576b"],
            [0.6666666666666666, "#ed7953"],
            [0.7777777777777778, "#fb9f3a"],
            [0.8888888888888888, "#fdca26"],
            [1.0, "#f0f921"]
          ],
          "sequentialminus": [
            [0.0, "#0d0887"],
            [0.1111111111111111, "#46039f"],
            [0.2222222222222222, "#7201a8"],
            [0.3333333333333333, "#9c179e"],
            [0.4444444444444444, "#bd3786"],
            [0.5555555555555556, "#d8576b"],
            [0.6666666666666666, "#ed7953"],
            [0.7777777777777778, "#fb9f3a"],
            [0.8888888888888888, "#fdca26"],
            [1.0, "#f0f921"]
          ],
          "diverging": [
            [0, "#8e0152"],
            [0.1, "#c51b7d"],
            [0.2, "#de77ae"],
            [0.3, "#f1b6da"],
            [0.4, "#fde0ef"],
            [0.5, "#f7f7f7"],
            [0.6, "#e6f5d0"],
            [0.7, "#b8e186"],
            [0.8, "#7fbc41"],
            [0.9, "#4d9221"],
            [1, "#276419"]
          ]
        },
        "xaxis": {
          "gridcolor": "white",
          "linecolor": "white",
          "ticks": "",
          "title": {
            "standoff": 15
          },
          "zerolinecolor": "white",
          "automargin": true,
          "zerolinewidth": 2
        },
        "yaxis": {
          "gridcolor": "white",
          "linecolor": "white",
          "ticks": "",
          "title": {
            "standoff": 15
          },
          "zerolinecolor": "white",
          "automargin": true,
          "zerolinewidth": 2
        },
        "scene": {
          "xaxis": {
            "backgroundcolor": "#E5ECF6",
            "gridcolor": "white",
            "linecolor": "white",
            "showbackground": true,
            "ticks": "",
            "zerolinecolor": "white",
            "gridwidth": 2
          },
          "yaxis": {
            "backgroundcolor": "#E5ECF6",
            "gridcolor": "white",
            "linecolor": "white",
            "showbackground": true,
            "ticks": "",
            "zerolinecolor": "white",
            "gridwidth": 2
          },
          "zaxis": {
            "backgroundcolor": "#E5ECF6",
            "gridcolor": "white",
            "linecolor": "white",
            "showbackground": true,
            "ticks": "",
            "zerolinecolor": "white",
            "gridwidth": 2
          }
        },
        "shapedefaults": {
          "line": {
            "color": "#2a3f5f"
          }
        },
        "annotationdefaults": {
          "arrowcolor": "#2a3f5f",
          "arrowhead": 0,
          "arrowwidth": 1
        },
        "geo": {
          "bgcolor": "white",
          "landcolor": "#E5ECF6",
          "subunitcolor": "white",
          "showland": true,
          "showlakes": true,
          "lakecolor": "white"
        },
        "title": {
          "x": 0.05
        },
        "mapbox": {
          "style": "light"
        }
      }
    },
    "title": {
      "text": "CCP for AAPL",
      "x": 0.5,
      "y": 1,
      "font": {
        "family": "Georgia",
        "size": 20,
        "color": "black",
        "weight": "bold"
      }
    },
    "xaxis": {
      "title": {
        "font": {
          "size": 14,
          "color": "black",
          "weight": "bold"
        },
        "text": "Quarter"
      },
      "tickangle": 45,
      "tickmode": "array",
      "tickvals": [
        "2018-09-30T00:00:00",
        "2018-12-31T00:00:00",
        "2019-03-31T00:00:00",
        "2019-06-30T00:00:00",
        "2019-09-30T00:00:00",
        "2019-12-31T00:00:00",
        "2020-03-31T00:00:00",
        "2020-06-30T00:00:00",
        "2020-09-30T00:00:00",
        "2020-12-31T00:00:00",
        "2021-03-31T00:00:00",
        "2021-06-30T00:00:00",
        "2021-09-30T00:00:00",
        "2021-12-31T00:00:00",
        "2022-03-31T00:00:00",
        "2022-06-30T00:00:00",
        "2022-09-30T00:00:00",
        "2022-12-31T00:00:00",
        "2023-03-31T00:00:00",
        "2023-06-30T00:00:00",
        "2023-09-30T00:00:00",
        "2023-12-31T00:00:00"
      ],
      "ticktext": [
        "2018 Q3",
        "2018 Q4",
        "2019 Q1",
        "2019 Q2",
        "2019 Q3",
        "2019 Q4",
        "2020 Q1",
        "2020 Q2",
        "2020 Q3",
        "2020 Q4",
        "2021 Q1",
        "2021 Q2",
        "2021 Q3",
        "2021 Q4",
        "2022 Q1",
        "2022 Q2",
        "2022 Q3",
        "2022 Q4",
        "2023 Q1",
        "2023 Q2",
        "2023 Q3",
        "2023 Q4"
      ],
      "showline": false,
      "zeroline": true,
      "zerolinecolor": "black",
      "zerolinewidth": 2,
      "showgrid": false
    },
    "yaxis": {
      "title": {
        "font": {
          "size": 14,
          "color": "black",
          "weight": "bold"
        },
        "text": "CCP, $ M"
      },
      "showgrid": false,
      "range": [
        0,
        117878.2
      ],
      "showline": true,
      "linecolor": "black",
      "linewidth": 1,
      "zeroline": true,
      "zerolinecolor": "black",
      "zerolinewidth": 2
    },
    "plot_bgcolor": "white",
    "showlegend": true,
    "legend": {
      "title": {
        "text": "Metric"
      }
    }
  }
};
