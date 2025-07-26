import turf from '@turf/turf'
import twig from 'twig'

twig.extendFilter('geomBuffer', function (value, param) {
  let geometry = JSON.parse(value)

  geometry = turf.buffer(geometry, param[0])

  return twig.filters.raw(JSON.stringify(geometry))
})
