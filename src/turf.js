import * as turf from '@turf/turf'
import twig from 'twig'

const filters = {
  geomBuffer: {
    func: turf.buffer
  },
  geomCenter: {
    func: turf.center
  },
  geomConcave: {
    func: turf.concave,
    prepare: 'convertToFeatureCollection'
  },
  geomLineString: {
    func: turf.lineString
  },
  geomPointsToLineString: {
    func: (value) => {
      if (value.type === 'GeometryCollection') {
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: value.geometries
              .map(geom => {
                if (geom.type === 'Point') {
                  return geom.coordinates
                }
              })
              .filter(coordinate => coordinate)
          }
        }
      }
      else if (value.type === 'MultiPoint') {
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: value.coordinates
          }
        }
      }
    }
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
