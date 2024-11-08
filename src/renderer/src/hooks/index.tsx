import { DependencyList, useEffect, useState } from 'react'
import { winElectron } from '@renderer/lib/utils'

/**
 * Scrolls an element to the top when the dependency list changes.
 * @param {React.MutableRefObject<HTMLDivElement | null>} ref - The element to scroll.
 * @param {DependencyList} deps - The dependency list.
 */
export const useScrollToTop = (
  ref: React.MutableRefObject<HTMLDivElement | null>,
  deps: DependencyList
) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = 0
    }
  }, deps)
}

/**
 * Returns an array of installed applications.
 * @returns {ApplicationT[]} - A list of installed applications.
 */
export const useInstalledApplications = (): ApplicationT[] => {
  const [applications, setApplications] = useState<ApplicationT[]>([])

  useEffect(() => {
    const getInstalledApplications = async () => {
      if (winElectron && winElectron.listInstalledApplications) {
        const appsFound = await winElectron.listInstalledApplications()
        setApplications(appsFound)
      }
    }

    getInstalledApplications()
  }, [])

  return applications
}

/**
 * Fetches plugin actions for a given plugin and command
 * @param pluginName name of the plugin to fetch actions for
 * @param commandName name of the command to fetch actions for
 * @returns array of actions for the given plugin and command
 */
export const useFetchActions = (pluginName: string, commandName: string) => {
  const [actions, setActions] = useState<ActionT[]>([])

  useEffect(() => {
    async function fetchActions() {
      if (pluginName && commandName) {
        const pluginActions = await winElectron.getPluginActions(pluginName, commandName)
        setActions(pluginActions)
      }
    }

    fetchActions()
  }, [pluginName, commandName])

  return actions
}

/**
 * Observe selected option in the command list and return the selected value.
 * @param {ResultT[]} commandResult - Result of the command execution.
 * @returns {ResultT['data'] | undefined} - The selected value.
 */
export const useObserveSelectedOption = (commandResult: ResultT[]) => {
  const [selectedValue, setSelectedValue] = useState<ResultT['data']>()

  useEffect(() => {
    const getData = (id: string | null) => {
      return commandResult?.find((result) => result.data.id === id)?.data
    }

    const observer = new MutationObserver(() => {
      const selectedItem = document.querySelector('[role="option"][data-selected="true"]')

      if (selectedItem) setSelectedValue(getData(selectedItem.getAttribute('data-value')))
      else setSelectedValue(undefined)
    })

    const options = document.querySelectorAll('[role="option"]')
    options.forEach((option) => observer.observe(option, { attributes: true }))

    return () => observer.disconnect()
  }, [commandResult])

  return selectedValue
}
