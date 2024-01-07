export class States {
    states = [];

    addStatesToUser(userId, state, value){
        this.states.push({
            userId: userId,
            state: state,
            value: value
        })
    }

    getStatesToUser(userId){
        return this.states.filter(state => state.userId === userId);
    }

    deleteStatesToUser(userId){
        this.states = this.states.filter(state => state.userId !== userId);
    }
}