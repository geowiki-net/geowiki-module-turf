import * as turf from '@turf/turf'
import twig from 'twig'

twig.extendFilter('geomBuffer', function (value, param) {
  let geometry = JSON.parse(value)

  let result = turf.buffer(geometry, param[0], param[1])

  if (result.type === 'FeatureCollection') {
    result = {
      type: 'GeometryCollection',
      geometries: result.features.map(feature => {
        return feature.geometry
      })
    }
  } else {
    result = result.geometry
  }

  return twig.filters.raw(JSON.stringify(result))
})

twig.extendFilter('geomConcave', function (value, param) {
  let geometry = JSON.parse(value)

  const collection = toFeatureCollection(geometry)
  const result = turf.concave(collection, param[0])

  if (result) {
    return twig.filters.raw(JSON.stringify(result.geometry))
  }

  return value
})

function toFeatureCollection (geometry) {
  if (geometry.type === 'GeometryCollection') {
    return {
      type: 'FeatureCollection',
      features: geometry.geometries.map(geometry => {
        return {
          type: 'Feature',
          properties: {},
          geometry
        }
      })
    }
  }

  return {
    type: 'Feature',
    properties: {},
    geometry
  }
}
