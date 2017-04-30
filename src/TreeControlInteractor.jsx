import React, {Component} from 'react'
import {PortalTabs} from './mocks'
import {TreeControl} from './TreeControl'

export class TreeControlInteractor extends Component {

  componentWillMount(){
    PortalTabs[0].ChildrenSelected=true;
    this.setState({tabs:PortalTabs})
  }

  traverse = (comparator) => {
    const copy = this.state.tabs
    let ChildTabs = copy
    const cached_childtabs = []
    cached_childtabs.push(ChildTabs)
    const condition = cached_childtabs.length > 0

    const loop = () => {
      const childtab = cached_childtabs.length ? cached_childtabs.shift() : null
      const left = () => childtab.forEach(tab => {
        Array.isArray(tab.ChildTabs) ? comparator(tab, copy) : null;
        Array.isArray(tab.ChildTabs) && tab.ChildTabs.length ? cached_childtabs.push(tab.ChildTabs) : null;
        condition ? loop() : exit()
      })
      const right = () => null;
      childtab ? left() : right()
    }

    const exit = () => null

    loop();
    return;
  }

  findParent = (tabdata) => {

    let parent = {}
    const capture = (tab) => {
      parent=tab || {}
    }
    const find = (tab, copy) => {
      const condition = parseInt(tab.TabId) === parseInt(tabdata.ParentTabId);
      condition ? capture(tab) : null;
    };
    this.traverse(find)
    return parent
  }

  updateTree = (tabdata) => {

    let updateTab = null
    let newState = null
    const capture = (tab, copy) => {
      tab=JSON.parse(JSON.stringify(tabdata))
      newState=copy
    }
    const find = (tab, copy) => {
      parseInt(tab.TabId) === parseInt(tabdata.TabId) ? capture(tab, copy) : null;
    }
    this.traverse(find)
    console.log(newState)
    this.setState({tabs:newState})
  }



  render() {
    return (
      <TreeControl
          fullyChecked={2}
          individuallyChecked={1}
          unchecked={0}
          tabs={this.state.tabs}
          updateTree={this.updateTree}
          findParent={this.findParent} />
    )
  }
}
