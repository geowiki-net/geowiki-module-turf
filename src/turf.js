import * as turf from '@turf/turf'
import twig from 'twig'

const filters = {
  geomBuffer: {
    func: turf.buffer
  },
  geomConcave: {
    func: turf.concave,
    prepare: 'convertToFeatureCollection'
  }
}

Object.entries(filters).forEach(([ name, def ]) => {
  twig.extendFilter(name, function (value, param) {
    if (!value) {
      return null
    }

    let geometry = JSON.parse(value)

    if (def.prepare === 'convertToFeatureCollection') {
      geometry = toFeatureCollection(geometry)
    }

    let result = def.func(geometry, ...(param || []))

    if (!result) {
      return null
    } else if (result.type === 'FeatureCollection') {
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
