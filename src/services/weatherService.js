// 天气API服务
import axios from 'axios'

// 使用和风天气API - 更准确的天气预报服务
const WEATHER_API_KEY = '6ce7f9b7a999492aa0ef37656f88d8b8'
const WEATHER_BASE_URL = 'https://nf2pg6mbpv.re.qweatherapi.com/v7'

/**
 * 获取指定日期的天气信息
 * @param {string} date - 日期字符串 (YYYY-MM-DD)
 * @param {string} city - 城市名称
 * @returns {Promise<Object>} 天气信息
 */
export async function getWeatherForDate(date, city = 'Hangzhou') {
  try {
    // 使用和风天气API获取7天天气预报
    const response = await axios.get(`${WEATHER_BASE_URL}/weather/7d`, {
      params: {
        location: '101210101', // 杭州的城市ID
        key: WEATHER_API_KEY
      }
    })
    
    if (response.data && response.data.code === '200' && response.data.daily) {
      // 找到对应日期的天气数据
      const targetDate = new Date(date).toISOString().split('T')[0]
      const weatherData = response.data.daily.find(day => day.fxDate === targetDate)
      
      if (weatherData) {
        return {
          date: date,
          temperature: {
            min: parseFloat(weatherData.tempMin),
            max: parseFloat(weatherData.tempMax),
            current: parseFloat(weatherData.tempMax) // 使用最高温度作为当前温度
          },
          weather: {
            main: weatherData.textDay,
            description: weatherData.textDay,
            icon: weatherData.iconDay
          },
          humidity: parseFloat(weatherData.humidity),
          windSpeed: parseFloat(weatherData.windSpeedDay),
          precipitation: parseFloat(weatherData.precip) || 0
        }
      }
    }
    
    throw new Error('无法获取天气数据')
  } catch (error) {
    console.error('获取天气信息失败:', error)
    throw new Error(`获取天气信息失败: ${error.message}`)
  }
}

/**
 * 获取多个日期的天气信息
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} 天气信息数组
 */
export async function getWeatherForDateRange(startDate, endDate, city = 'Hangzhou') {
  try {
    // 使用和风天气API一次性获取7天天气预报
    const response = await axios.get(`${WEATHER_BASE_URL}/weather/7d`, {
      params: {
        location: '101210101', // 杭州的城市ID
        key: WEATHER_API_KEY
      }
    })
    
    if (response.data && response.data.code === '200' && response.data.daily) {
      const weatherData = []
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // 遍历请求的日期范围
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0]
        
        // 在API返回的7天数据中查找对应日期
        const weatherDay = response.data.daily.find(day => day.fxDate === dateStr)
        
        if (weatherDay) {
          weatherData.push({
            date: dateStr,
            temperature: {
              min: parseFloat(weatherDay.tempMin),
              max: parseFloat(weatherDay.tempMax),
              current: parseFloat(weatherDay.tempMax)
            },
            weather: {
              main: weatherDay.textDay,
              description: weatherDay.textDay,
              icon: weatherDay.iconDay
            },
            humidity: parseFloat(weatherDay.humidity),
            windSpeed: parseFloat(weatherDay.windSpeedDay),
            precipitation: parseFloat(weatherDay.precip) || 0
          })
        }
      }
      
      return weatherData
    }
    
    throw new Error('无法获取天气数据')
  } catch (error) {
    console.error('获取天气信息失败:', error)
    throw new Error(`获取天气信息失败: ${error.message}`)
  }
}





/**
 * 获取天气图标
 * @param {string} weatherType - 天气类型
 * @returns {string} 天气图标
 */
function getWeatherIcon(weatherType) {
  const icons = {
    '晴': '100',
    '多云': '101',
    '阴': '104',
    '雨': '305',
    '小雨': '305',
    '中雨': '306',
    '大雨': '307',
    '雪': '400',
    '小雪': '400',
    '中雪': '401',
    '雷阵雨': '302',
    '雾': '501'
  }
  return icons[weatherType] || '100'
}

/**
 * 格式化天气信息为提示词
 * @param {Array} weatherData - 天气数据数组
 * @returns {string} 格式化的天气信息
 */
export function formatWeatherForPrompt(weatherData) {
  if (!weatherData || weatherData.length === 0) {
    return ''
  }
  
  let weatherInfo = '\n\n天气信息：\n'
  
  weatherData.forEach((day, index) => {
    const date = new Date(day.date)
    const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`
    
    weatherInfo += `${dayName}（${dateStr}）：${day.weather.description}，温度${day.temperature.min.toFixed(1)}°C-${day.temperature.max.toFixed(1)}°C`
    
    if (day.precipitation > 0) {
      weatherInfo += `，降水量${day.precipitation.toFixed(1)}mm`
    }
    
    weatherInfo += '\n'
  })
  
  return weatherInfo
} 