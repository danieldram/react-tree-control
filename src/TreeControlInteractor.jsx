import React, {Component} from 'react'
import {PortalTabs} from './mocks'
import {TreeControl} from './TreeControl'

export class TreeControlInteractor extends Component {

  constructor() {
    super()
    this.fullyChecked = 2
    this.individuallyChecked = 1
    this.unchecked = 0
  }

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
    this.setState({tabs:newState})

  }

  reAlignTree = () => {

    let iterationsArray =  []
    const iterations = (t) => t.ChildTabs.length ? iterationsArray.push(...t.ChildTabs) : null
    this.traverse(iterations)

    const realign = (tab)  => {
      iterationsArray = []
      let sum = 0;
      let newState = null
      const tabsWithChildren = []
      const tabsWithoutChildren = []
      const ChildTabs = tab.ChildTabs;

      tab.ChildTabs.forEach( (t) => {
        t.HasChildren ? tabsWithChildren.push(t) : tabsWithoutChildren.push(t)
      })

      const expect = tabsWithoutChildren.length + tabsWithChildren.length*this.fullyChecked

      tabsWithoutChildren.forEach( t =>  {
        t.CheckedState===this.individuallyChecked ? sum+=1 : null
      })

      tabsWithChildren.forEach( t =>  {
        switch(true) {
          case t.CheckedState===this.fullyChecked:
            sum+=2
          return
          case t.CheckedState===this.individuallyChecked:
            sum+=1
          return
          default:
          return
        }
      })

      sum=sum

      switch (true) {
        case sum === expect && tab.HasChildren :
          tab.CheckedState=tab.CheckedState ? this.fullyChecked : tab.CheckedState;

        break
        case sum!==0 && sum === expect && !tab.HasChildren :
          tab.CheckedState=this.individuallyChecked;

        break
        case sum!==0 && sum < expect:
          tab.CheckedState = tab.CheckedState===this.fullyChecked ? this.individuallyChecked : tab.CheckedState;

        break
        default:
        break
      }

      this.updateTree(tab)
    }

    iterationsArray.forEach( iter => this.traverse(realign) )


  }

  render() {
    return (
      <TreeControl
          fullyChecked={this.fullyChecked}
          individuallyChecked={this.individuallyChecked}
          unchecked={this.unchecked}
          tabs={this.state.tabs}
          updateTree={this.updateTree}
          reAlignTree={this.reAlignTree}
          findParent={this.findParent} />
    )
  }
}
