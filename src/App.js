import React from 'react';
import uuidv1 from 'uuid/v1';
import {SortableContainer, SortableElement, SortableHandle, arrayMove} from 'react-sortable-hoc';

require('./App.css');

export default class App extends React.Component {
	constructor(props) {
		super(props);

		const { extension } = props;
		const existingValue = extension.field.getValue();
		this.state = {
			values: existingValue == null ? [] : [...existingValue],
			focus: false,
			dragging: false,
		};
	}

	componentDidMount() {
		console.log('componentDidMount');
		const { extension } = this.props;
		console.log(this.state.values);
		extension.window.startAutoResizer();
	}

	componentWillUnmount() {
		console.log('componentWillUnmount');
		const { extension } = this.props;
		extension.window.stopAutoResizer();
	}

	render() {
		console.log('render');
		const { values, focus, dragging } = this.state;

		return (
			<React.Fragment>
				<SortableList
					items={values}
					onChange={this.handleChange}
					onDelete={this.handleDeleteItemClick}
					focus={focus}
					onSortStart={this.handleSortStart}
					onSortEnd={this.handleSortEnd}
					lockAxis="y"
					useDragHandle={true}
					helperClass="helper"
					dragging={dragging}
				/>
				<button type="button" className="cf-btn-secondary" onClick={this.handleAddItemClick}>
					Add item
				</button>
			</React.Fragment>
		);
	}

	handleAddItemClick = () => {
		console.log('handleAddItemClick');
		this.setState(({values: prevValues}) => {
			return {
				values: [
					...prevValues,
					{
						id: uuidv1(),
						song: '',
						duration: ''
					}
				],
				focus: true,
			};
		}, () => {
			this.reportValues();
		});
	}

	handleDeleteItemClick = (event) => {
		console.log('handleDeleteItemClick');
		const li = event.currentTarget.closest('li');
		this.setState(({values: prevValues}) => {
			const index = prevValues.findIndex(({id}) => id === li.dataset.id);
			if (index === -1) {
				console.error("Didn't find value in state", event, prevValues);
				return;
			}
			return {
				values: [
					...prevValues.slice(0, index),
					...prevValues.slice(index + 1),
				],
				focus: false,
			};
		}, this.reportValues);
	}

	handleChange = (event) => {
		const input = event.currentTarget;
		const song = event.currentTarget.closest('li')
		const songTitle = song.querySelector('.song-title')
		const songDuration = song.querySelector('.song-duration')

		this.setState(({values: prevValues}) => {
			const index = prevValues.findIndex(({id}) => id === input.closest('li').dataset.id);
			if (index === -1) {
				console.error("Didn't find value in state", event, prevValues);
				return;
			}
			const id = prevValues[index].id;
			return {
				values: [
					...prevValues.slice(0, index),
					{
						id: id,
						song: songTitle.value,
						duration: songDuration.value
					},
					...prevValues.slice(index + 1),
				],
				focus: false,
			};
		}, this.reportValues);
	}

	handleSortStart = () => {
		console.log('handleSortStart');
		this.setState({
			dragging: true,
			focus: false,
		});
	}

	handleSortEnd = ({oldIndex, newIndex}) => {
		console.log('handleSortEnd');
		this.setState(({values: prevValues}) => ({
			values: arrayMove(prevValues, oldIndex, newIndex),
			dragging: false,
			focus: false,
		}), this.reportValues);
	}

	async reportValues() {
		const { extension } = this.props;
		const { values } = this.state;
		console.log(values);
		return await extension.field.setValue(values);
	}
}

const Handle = SortableHandle(() => (
	<div className="drag-handle" />
));

const SortableItem = SortableElement(({id, song, duration, onChange, onDelete, autoFocus}) => (
	<li className="item" data-id={id}>
		<Handle />
		<input className="cf-form-input song-title" value={song} onChange={onChange} autoFocus={autoFocus} placeholder="song" />
		<input className="cf-form-input song-duration" value={duration} onChange={onChange} placeholder="duration"/>
		<div className="is-segue">
			<input type="checkbox" className="cf-form-option" name="segue"/>
			<label htmlFor="">Segue?</label>
		</div>
		<button type="button" className="cf-btn-secondary delete-button" title="Delete" onClick={onDelete}>
			&times;
		</button>
	</li>
));

const SortableList = SortableContainer(({items, onChange, onDelete, focus, dragging}) => (
	<ol className={`item-list ${dragging ? 'dragging' : ''}`}>
		{Object.keys(items).map(({id, song, duration}, index) => (
			<SortableItem
				key={id}
				id={id}
				index={index}
				song={song}
				duration={duration}
				onChange={onChange}
				onDelete={onDelete}
				autoFocus={index === items.length - 1 && focus}
			/>
		))}
	</ol>
));
